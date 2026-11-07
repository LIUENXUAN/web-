import sys, os
sys.stdout.reconfigure(encoding='utf-8')

base = r"D:\营地 3D大赛\website（最终版）"
src = os.path.join(base, "src", "main", "resources", "static", "visitor-portal.html")

with open(src, 'r', encoding='utf-8') as f:
    content = f.read()

style_end = content.find('</style>')

extra = """
.filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.filter-bar input{padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(119,217,239,0.08);border-radius:8px;color:#d0e0d8;font-size:13px;outline:none;width:200px}
.filter-bar input:focus{border-color:rgba(74,154,94,0.5)}
.filter-bar select{padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(119,217,239,0.08);border-radius:8px;color:#d0e0d8;font-size:13px;outline:none}
.data-table{width:100%;border-collapse:collapse;font-size:12px}
.data-table th{text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#80a898;font-size:10px;text-transform:uppercase;letter-spacing:.3px}
.data-table td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#d0e0d8}
.data-table tr:hover td{background:rgba(255,255,255,0.02)}
.btn{padding:8px 16px;border-radius:6px;font-size:12px;cursor:pointer;border:none;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:4px}
.btn-primary{background:#3d7a4a;color:#fff}
.btn-primary:hover{background:#2e6a3a}
.btn-success{background:rgba(74,158,94,0.12);color:#4a9e5e;border:1px solid rgba(74,158,94,0.25)}
.btn-success:hover{background:rgba(74,158,94,0.2)}
.btn-warning{background:rgba(212,149,42,0.12);color:#d4952a;border:1px solid rgba(212,149,42,0.25)}
.btn-warning:hover{background:rgba(212,149,42,0.2)}
.btn-danger{background:rgba(232,112,96,0.1);color:#e87060;border:1px solid rgba(232,112,96,0.25)}
.btn-danger:hover{background:rgba(232,112,96,0.18)}
.btn-ghost{background:transparent;color:#80a898;border:1px solid rgba(255,255,255,0.08)}
.btn-ghost:hover{background:rgba(255,255,255,0.04)}
.btn-sm{padding:5px 12px;font-size:11px}
.btn-xs{padding:3px 8px;font-size:10px;border-radius:4px}
.health-bar{display:flex;align-items:center;gap:6px}
.health-bar .bar{width:60px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden}
.health-bar .fill{height:100%;border-radius:3px;transition:width .3s}
.health-bar .val{font-size:11px;color:#80a898}
.level-high{background:rgba(232,112,96,0.15);color:#e87060;border:1px solid rgba(232,112,96,0.25)}
.level-mid{background:rgba(212,149,42,0.15);color:#d4952a;border:1px solid rgba(212,149,42,0.25)}
.level-low{background:rgba(74,158,94,0.15);color:#4a9e5e;border:1px solid rgba(74,158,94,0.25)}
.page-header-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.page-header-bar .count{font-size:12px;color:#80a898}
.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.modal-box{width:520px;max-width:92vw;max-height:85vh;overflow-y:auto;background:rgba(12,22,18,0.96);border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:0;backdrop-filter:blur(12px)}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,0.06)}
.modal-header h3{font-size:16px;font-weight:600;color:#e0f0e8}
.modal-close{background:none;border:none;color:#80a898;font-size:18px;cursor:pointer;padding:4px}
.modal-body{padding:20px 24px}
.modal-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:flex-end;gap:10px}
.form-group{margin-bottom:14px}
.form-group label{display:block;font-size:12px;color:#90b8a8;margin-bottom:6px;font-weight:500}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:9px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(119,217,239,0.08);border-radius:8px;color:#d0e0d8;font-size:13px;outline:none;font-family:inherit;transition:border .2s}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:rgba(74,154,94,0.5)}
.form-group textarea{resize:vertical;min-height:80px}
.form-row{display:flex;gap:12px}
.form-row .form-group{flex:1}
"""

prefix = content[:style_end] + extra + '</style>'
print('PREFIX_OK len=' + str(len(prefix)))
