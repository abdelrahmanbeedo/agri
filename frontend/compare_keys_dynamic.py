import re, os, ast, json

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
def extract_defined_keys(content, section_name):
    """Extract all flattened keys from a nested object section."""
    keys = set()
    # Parse using regex to flatten nested objects
    # Pattern: find lines like `  key: 'value'` or `  key: {`
    # We need to track nesting level
    
    # Instead, extract manually: find all path patterns
    # Look for patterns like section.subsection: { ... key: 'value' ... }
    
    # Simple approach: find the section and parse within its braces
    # Start from section_name marker
    
    # Find the section in content
    start_idx = content.find(f"    {section_name}: {{")
    if start_idx == -1:
        return keys
    
    # Track brace depth from start_idx
    depth = 0
    i = start_idx
    while i < len(content):
        ch = content[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                # Found the closing brace of the top-level section
                section_content = content[start_idx:i+1]
                break
        i += 1
    
    # Now parse the section_content to extract flattened keys
    # Remove the section header line
    lines = section_content.split('\n')
    
    # Track current path
    path_stack = []
    result = set()
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('//') or stripped in (',', '{', '}'):
            continue
        
        # Match key: value or key: {
        m = re.match(r'^(\w+):\s*(.*)$', stripped)
        if m:
            key = m.group(1)
            rest = m.group(2).strip()
            
            if rest == '{' or rest.endswith('{'):
                path_stack.append(key)
            elif rest.startswith("'") or rest.startswith('"'):
                # String value - this is a leaf
                full_key = '.'.join(path_stack + [key])
                result.add(full_key)
            # Skip array values etc.
    
    return result

with open(r'C:\Users\User\Desktop\agri\frontend\src\i18n\translations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the en section
defined_keys = set()
# Find all top-level keys under 'en'
# Use regex to find patterns like `    key: {`
top_level = re.findall(r'    (\w+): \{', content)
for section in top_level:
    section_keys = extract_defined_keys(content, section)
    defined_keys.update(section_keys)

# --- Compare ---
missing = used_keys - defined_keys
orphaned = defined_keys - used_keys
# Filter out false positives from searchParams
false_positives = {'conversation', 'role'}
missing_filtered = {k for k in missing if k not in false_positives}

print("=== MISSING TRANSLATIONS (used in code but NOT defined) ===\n")
if missing_filtered:
    for k in sorted(missing_filtered):
        print(f"  {k}")
else:
    print("  NONE - all keys are defined!")
print()

print(f"=== Note: False positives excluded: {false_positives & missing} ===\n")

print("=== ORPHANED KEYS (defined but NOT used) ===\n")
if orphaned:
    for k in sorted(orphaned):
        print(f"  {k}")
else:
    print("  NONE")
print()

print(f"Summary: {len(used_keys)} used keys, {len(defined_keys)} defined keys, {len(missing_filtered)} missing")
