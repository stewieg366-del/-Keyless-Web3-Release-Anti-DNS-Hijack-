with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#e2e8f0' }}>",
    '<div className="tx-box">'
)
content = content.replace(
    "color: txStatus === 'CONFIRMED' ? '#059669' : txStatus === 'PENDING' ? '#d97706' : '#dc2626'",
    "color: txStatus === 'CONFIRMED' ? '#4ade80' : txStatus === 'PENDING' ? '#fbbf24' : '#f87171'"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
