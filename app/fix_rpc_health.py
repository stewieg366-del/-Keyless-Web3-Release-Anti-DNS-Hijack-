import re

with open('src/App.css', 'r') as f:
    css = f.read()

# Replace the existing .rpc-health block with dynamic ones
rpc_css_replacement = """
/* Phase 5.4 RPC Health UI - DYNAMIC THEME */
.rpc-health {
  margin-top: 1.5rem;
  border-radius: 12px;
  padding: 1.5rem;
  color: #f1f5f9;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.rpc-health h3 {
  margin-top: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding-bottom: 0.75rem;
  transition: all 0.3s ease;
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
}

.block-num {
  color: #94a3b8;
}

.consensus-box {
  padding: 1.25rem;
  border-radius: 8px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.consensus-box h4 {
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.05em;
}

.consensus-box p {
  margin: 0.25rem 0;
}

/* CRITICAL STATE (Red) */
.rpc-health.rpc-critical {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.15);
}
.rpc-health.rpc-critical h3 {
  color: #f87171;
  border-bottom: 1px solid rgba(239, 68, 68, 0.3);
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}
.rpc-critical .consensus-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.15);
}
.rpc-critical .consensus-box h4 {
  color: #fca5a5;
}
.rpc-critical .rpc-table td {
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

/* HEALTHY STATE (Green) */
.rpc-health.rpc-healthy {
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.4);
  box-shadow: 0 0 25px rgba(74, 222, 128, 0.15);
}
.rpc-health.rpc-healthy h3 {
  color: #4ade80;
  border-bottom: 1px solid rgba(74, 222, 128, 0.3);
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}
.rpc-healthy .consensus-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(74, 222, 128, 0.5);
  box-shadow: inset 0 0 20px rgba(74, 222, 128, 0.15);
}
.rpc-healthy .consensus-box h4 {
  color: #86efac;
}
.rpc-healthy .rpc-table td {
  border-bottom: 1px solid rgba(74, 222, 128, 0.2);
}

/* Row specific colors */
.rpc-row-healthy {
  color: #4ade80 !important;
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.4);
}
.rpc-row-critical {
  color: #f87171 !important;
  text-shadow: 0 0 5px rgba(239, 68, 68, 0.4);
}

.warning-text {
  color: #fbbf24 !important;
  text-shadow: 0 0 5px rgba(251, 191, 36, 0.4);
}

.error-text {
  color: #f87171 !important;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}
"""

start_idx = css.find('/* Phase 5.4 RPC Health UI - CRITICAL THEME */')
if start_idx == -1:
    start_idx = css.find('/* Phase 5.4 RPC Health UI */')
if start_idx != -1:
    end_idx = css.find('/* Transaction box */')
    if end_idx != -1:
        css = css[:start_idx] + rpc_css_replacement + css[end_idx:]

with open('src/App.css', 'w') as f:
    f.write(css)

