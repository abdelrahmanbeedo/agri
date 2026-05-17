import re, os

# --- Extract used keys from source files ---
used_keys = set()
src = r'C:\Users\User\Desktop\agri\frontend\src'
for root, dirs, files in os.walk(src):
    for f in files:
        if f.endswith(('.jsx', '.js')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
            for m in re.finditer(r"t\(['\"]([^'\"]+)['\"]\)", content):
                used_keys.add(m.group(1))

# --- Extract defined keys from translations.js ---
with open(r'C:\Users\User\Desktop\agri\frontend\src\i18n\translations.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the 'en' block by tracking structural braces only
# Structural opens: lines matching `key: {` (where { is the last non-comment char)
# Structural closes: lines that when stripped are just `}` or `},` or `});`
en_start = -1
en_end = -1
brace_depth = 0
found_en = False

for i, line in enumerate(lines):
    stripped = line.strip()
    
    # Detect structural close brace: line is just `}` or `},` or `});` etc.
    close_match = re.match(r'^}(\s*,\s*)?$', stripped) or re.match(r'^},?\s*$', stripped) or stripped == '}'
    
    # Detect structural open brace: `key: {` pattern
    open_match = re.match(r'^(\w+):\s*\{\s*$', stripped)
    
    if open_match:
        key = open_match.group(1)
        if key == 'en':
            en_start = i
            brace_depth = 0
            found_en = True
            continue
        
        if found_en:
            brace_depth += 1
    
    if close_match and found_en:
        brace_depth -= 1
        if brace_depth < 0:
            en_end = i
            break

# Process only en block lines (between en_start+1 and en_end)
path_stack = []
defined_keys = set()

for i in range(en_start + 1, en_end + 1):
    line = lines[i]
    stripped = line.strip()
    
    if not stripped or stripped.startswith('//'):
        continue
    
    # Handle closing braces (structural only)
    if stripped == '}' or stripped.startswith('},') or stripped == '});':
        close_count = stripped.count('}')
        for _ in range(close_count):
            if path_stack:
                path_stack.pop()
        continue
    
    # Handle opening section headers: `key: {`
    open_match = re.match(r'^(\w+):\s*\{\s*$', stripped)
    if open_match:
        path_stack.append(open_match.group(1))
        continue
    
    # Handle leaf keys: `key: 'value'`
    clean = stripped.rstrip(',')
    m = re.match(r"^(\w+):\s*'([^']*)'$", clean)
    if not m:
        m = re.match(r'^(\w+):\s*"([^"]*)"$', clean)
    if m:
        full_key = '.'.join(path_stack + [m.group(1)])
        defined_keys.add(full_key)

# Remove false positives from used_keys
false_positives = {'conversation', 'role'}
used_keys_clean = used_keys - false_positives

missing = used_keys_clean - defined_keys
orphaned = defined_keys - used_keys_clean

print("=== MISSING TRANSLATIONS (used but NOT defined) ===\n")
for k in sorted(missing):
    print(f"  {k}")
if not missing:
    print("  (none)")

print(f"\n=== ORPHANED KEYS (defined but NOT used) ===\n")
for k in sorted(orphaned):
    print(f"  {k}")
if not orphaned:
    print("  (none)")

print(f"\n=== SUMMARY ===")
print(f"  Used keys: {len(used_keys_clean)}")
print(f"  Defined keys: {len(defined_keys)}")
print(f"  Missing: {len(missing)}")
print(f"  Orphaned: {len(orphaned)}")
