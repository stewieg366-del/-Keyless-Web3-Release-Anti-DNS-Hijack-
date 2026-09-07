import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace PENDING block
pending_original = """        {verificationState === 'PENDING' && (
          <p style={{ margin: 0, color: '#fbbf24', fontWeight: 'bold' }}>⚠ FRONTEND VERIFICATION REQUIRED</p>
        )}"""
pending_replacement = """        {verificationState === 'PENDING' && (
          <div style={{ color: '#fbbf24' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>⚠ FRONTEND VERIFICATION REQUIRED</p>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>DO NOT CONNECT YOUR WALLET.</p>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9em', color: '#e2e8f0' }}>This frontend must be cryptographically verified against the authorized release before any wallet interaction is permitted.</p>
            <button onClick={handleRecovery}>Restore Verified Frontend</button>
          </div>
        )}"""
content = content.replace(pending_original, pending_replacement)

# Replace Recover -> Restore strings
content = content.replace('>Recover Verified Frontend</button>', '>Restore Verified Frontend</button>')

# Wrap dApp UI in {verificationState === 'VALID' && ( ... )}
# Find the start of the dApp UI (the Wallet section)
wallet_section_start = content.find('      <div className="section">\n        <h3>Wallet</h3>')
if wallet_section_start != -1:
    footer_start = content.find('      <div className="footer-text">')
    if footer_start != -1:
        before_dapp = content[:wallet_section_start]
        dapp_ui = content[wallet_section_start:footer_start]
        after_dapp = content[footer_start:]
        
        # Indent dapp_ui for neatness (optional but good)
        # Wrap it
        wrapped_dapp_ui = "      {verificationState === 'VALID' && (\n        <>\n" + \
                          "".join(["    " + line + "\n" if line else "\n" for line in dapp_ui.split("\n")[:-1]]) + \
                          "        </>\n      )}\n"
        
        content = before_dapp + wrapped_dapp_ui + after_dapp

with open('src/App.tsx', 'w') as f:
    f.write(content)
