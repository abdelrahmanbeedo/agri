import re, os

missing = ['common.messages', 'common.orders', 'conversation', 'messages.search', 'modals.negotiatePrice.available', 'modals.placeOrder.deliveryPlaceholder', 'modals.placeOrder.maximum', 'modals.placeOrder.placeOrder', 'orderDetail.placedOn', 'orders.view', 'productCard.farmer', 'productDetail.loading', 'profile.saving', 'review.submitting', 'role']
src = r'C:\Users\User\Desktop\agri\frontend\src'

for m_key in missing:
    for root, dirs, files in os.walk(src):
        for f in files:
            if f.endswith(('.jsx', '.js')):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                    content = fh.read()
                escaped = re.escape(m_key)
                pattern = r"t\(['\"]" + escaped + r"['\"]\)"
                if re.search(pattern, content):
                    for i, line in enumerate(content.split('\n')):
                        if re.search(pattern, line):
                            print(f'{m_key} => {path}:{i+1}: {line.strip()[:150]}')
