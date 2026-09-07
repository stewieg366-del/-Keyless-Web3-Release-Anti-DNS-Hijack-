import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Title
content = content.replace('<h1>PS2 Security Demo</h1>', '<h1>Verence - Anti-DNS Hijacking</h1>')

# 2. Section inline styles
content = content.replace('<div className="section" style={{ background: \'#f8fafc\', border: \'1px solid #e2e8f0\' }}>', '<div className="section">')

# 3. Text colors
content = content.replace("color: '#d97706'", "color: '#fbbf24'")
content = content.replace("color: '#059669'", "color: '#4ade80'")
content = content.replace("color: '#dc2626'", "color: '#f87171'")
content = content.replace("color: '#1e293b'", "color: '#e2e8f0'")

# 4. Transaction box
content = content.replace("<div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#1e293b' }}>", '<div className="tx-box">')

# 5. Footer
if '<div className="footer-text">' not in content:
    content = content.replace('    </div>\n  )\n}\n\nexport default App', '      <div className="footer-text">Made By prabhat Kumar Jha and Shubhi misra |</div>\n    </div>\n  )\n}\n\nexport default App')

with open('src/App.tsx', 'w') as f:
    f.write(content)

