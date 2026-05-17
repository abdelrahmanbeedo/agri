import re, os

keys = set()
src = r'C:\Users\User\Desktop\agri\frontend\src'
for root, dirs, files in os.walk(src):
    for f in files:
        if f.endswith(('.jsx', '.js')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
            for m in re.finditer(r"t\(['\"]([^'\"]+)['\"]\)", content):
                keys.add(m.group(1))

for k in sorted(keys):
    print(k)
