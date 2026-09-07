with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="section rpc-health">',
    '<div className={`section rpc-health ${consensusResult?.state === \'CONSENSUS\' && (!consensusResult.outliers || consensusResult.outliers.length === 0) ? \'rpc-healthy\' : \'rpc-critical\'}`}>'
)

content = content.replace(
    '<tr key={r.id}>',
    '<tr key={r.id} className={r.success ? \'rpc-row-healthy\' : \'rpc-row-critical\'}>'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
