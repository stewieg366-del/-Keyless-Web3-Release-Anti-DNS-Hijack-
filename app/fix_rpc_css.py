import re

with open('src/App.css', 'r') as f:
    css = f.read()

# Replace the existing .rpc-health block
rpc_css_replacement = """
/* Phase 5.4 RPC Health UI - CRITICAL THEME */
.rpc-health {
  margin-top: 1.5rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  color: #f1f5f9;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.rpc-health h3 {
  margin-top: 0;
  color: #f87171;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(239, 68, 68, 0.3);
  padding-bottom: 0.75rem;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.rpc-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.rpc-table td {
  padding: 0.5rem;
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

.block-num {
  color: #94a3b8;
}

.consensus-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 1.25rem;
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.15);
}

.consensus-box h4 {
  margin: 0 0 0.5rem 0;
  color: #fca5a5;
  letter-spacing: 0.05em;
}

.consensus-box p {
  margin: 0.25rem 0;
}

.warning-text {
  color: #fbbf24 !important;
}

.error-text {
  color: #f87171 !important;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}
"""

# Find where .rpc-health starts and replace until .tx-box
start_idx = css.find('/* Phase 5.4 RPC Health UI */')
if start_idx != -1:
    end_idx = css.find('/* Transaction box */')
    if end_idx != -1:
        css = css[:start_idx] + rpc_css_replacement + css[end_idx:]

with open('src/App.css', 'w') as f:
    f.write(css)

