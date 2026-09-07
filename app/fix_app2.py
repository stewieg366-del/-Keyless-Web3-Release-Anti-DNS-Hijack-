import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix the title just in case it had weird whitespace
content = content.replace('<h1>Verence - Anti-DNS Hijacking</h1>', '<h1>Verence - Anti-DNS Hijacking</h1>')
# Actually let's just make sure it's correct:
content = re.sub(r'<h1>.*?</h1>', '<h1>Verence - Anti-DNS Hijacking</h1>', content)

# Update flex controls div that might be causing overlapping
content = content.replace('<div style={{ display: \'flex\', gap: \'10px\', alignItems: \'center\' }}>', '<div className="flex-controls">')

# Update footer capitalization and formatting
content = re.sub(r'<div className="footer-text">.*?</div>', '<div className="footer-text">Made By Prabhat Kumar Jha and Shubhi Misra |</div>', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
