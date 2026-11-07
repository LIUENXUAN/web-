import re

path = "D:/营地 3D大赛/website（最终版）/后台/admin/admin-spa.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find ActivitiesPage section
start = content.index("function ActivitiesPage()")
end = content.index("function FeedbackPage()", start)

new_section = '''function ActivitiesPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var _slist = useState(null), signupList = _slist[0], setSignupList = _slist[1];
  var _sloading = useState(false), signupLoading = _sloading[0], setSignupLoading = _sloading[1];
  var load = useCallback(function() { api("/api/admin/activities?page=" + page + "&size=10").then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ title: "", date: "", zone: "", quota: 20, joined: 0, status: "\u62a5\u540d\u4e2d", description: "" }); setModal("new"); };
  var openEdit = function(a) { setForm(Object.assign({}, a)); setModal("edit"); };
  var save = function() {
    var url = modal === "new" ? "/api/admin/activities" : "/api/admin/activities/" + form.id;
    var method = modal === "new" ? "POST" : "PUT";
    api(url, { method: method, body: JSON.stringify(form) }).then(function() { setModal(null); load(); });
  };
  var del = function(id) { if (confirm("\u786e\u8ba4\u5220\u9664\uff1f")) api("/api/admin/activities/" + id, { method: "DELETE" }).then(load); };
  var updateStatus = function(id, status) { api("/api/admin/activities/" + id + "/status", { method: "PUT", body: JSON.stringify({ status: status }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm("\u786e\u8ba4\u5220\u9664\uff1f")) Promise.all(selected.map(function(id) { return api("/api/admin/activities/" + id, { method: "DELETE" }); })).then(function() { setSelected([]); load(); }); };
  var showSignups = function(id) {
    setSignupLoading(true);
    setSignupList(null);
    api("/api/admin/activities/" + id + "/signups").then(function(list) { setSignupList(list); setSignupLoading(false); }).catch(function() { setSignupLoading(false); });
  };
  if (!data) return h("div", { className: "loading-state" }, "\u52a0\u8f7d\u4e2d...");
  return h("div", null,
    h("div", { className: "filter-bar" },
      h("button", { className: "btn btn-primary btn-sm", onClick: openNew }, "+ \u65b0\u589e\u6d3b\u52a8"),
      h("button", { className: "btn btn-ghost btn-sm", onClick: load }, "\ud83d\udd04 \u5237\u65b0"),
      h("div", { className: "export-bar" }, h("button", { className: "export-btn", onClick: function() { exportCSV(data.content || [], "\u6d3b\u52a8\u8bfe\u7a0b\u5bfc\u51fa"); } }, "\ud83d\udce5 CSV"))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete }),
    h("div", { className: "page-header-bar" }, h("span", { className: "count" }, "\u5171 " + (data.totalElements || 0) + " \u4e2a\u6d3b\u52a8")),
    h("table", { className: "data-table" },
      h("thead", null, h("tr", null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h("th", null, "\u6807\u9898"), h("th", null, "\u65e5\u671f"), h("th", null, "\u533a\u57df"), h("th", null, "\u540d\u989d"), h("th", null, "\u5df2\u62a5\u540d"), h("th", null, "\u72b6\u6001"), h("th", null, "\u64cd\u4f5c"))),
      h("tbody", null, (data.content || []).map(function(a) { return h("tr", { key: a.id },
        h(SelRow, { id: a.id, selected: selected, onToggle: toggleSel }),
        h("td", null, a.title), h("td", null, fmtDate(a.date)), h("td", null, a.zone || "-"), h("td", null, a.quota), h("td", null, a.joined + "/" + a.quota), h("td", null, statusTag(a.status)),
        h("td", { style: { whiteSpace: "nowrap" } },
          h("button", { className: "btn btn-xs", style: { background: "rgba(107,143,94,0.2)", color: "#6b8f5e", border: "1px solid rgba(107,143,94,0.3)", marginRight: 4 }, onClick: function() { openEdit(a); } }, "\u7f16\u8f91"),
          h("button", { className: "btn btn-xs", style: { background: "rgba(91,141,239,0.15)", color: "#5b8def", border: "1px solid rgba(91,141,239,0.25)", marginRight: 4 }, onClick: function() { showSignups(a.id); } }, "\u62a5\u540d\u540d\u5355"),
          a.status === "\u62a5\u540d\u4e2d" && h("button", { className: "btn btn-xs btn-warning", style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, "\u5df2\u6ee1\u5458"); } }, "\u6ee1\u5458"),
          a.status === "\u5df2\u6ee1\u5458" && h("button", { className: "btn btn-xs btn-success", style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, "\u62a5\u540d\u4e2d"); } }, "\u5f00\u653e"),
          a.status !== "\u5df2\u7ed3\u675f" && h("button", { className: "btn btn-xs", style: { background: "rgba(138,154,138,0.2)", color: "#8a9a8a", border: "1px solid rgba(138,154,138,0.3)", marginRight: 4 }, onClick: function() { updateStatus(a.id, "\u5df2\u7ed3\u675f"); } }, "\u7ed3\u675f"),
          h("button", { className: "btn btn-xs btn-danger", onClick: function() { del(a.id); } }, "\u5220\u9664"))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    signupList !== null && h("div", { className: "modal-overlay", onClick: function() { setSignupList(null); } },
      h("div", { className: "modal-box liquid-glass-strong", onClick: function(e) { e.stopPropagation(); }, style: { width: "520px" } },
        h("div", { className: "modal-header" }, h("h3", null, "\u62a5\u540d\u540d\u5355"), h("button", { className: "modal-close", onClick: function() { setSignupList(null); } }, "\u2715")),
        h("div", { className: "modal-body" },
          signupList.length === 0 ? h("div", { className: "empty-state", style: { textAlign: "center", padding: "30px 0", color: "#80a898" } }, "\u6682\u65e0\u62a5\u540d\u8bb0\u5f55")
          : h("table", { className: "data-table" },
            h("thead", null, h("tr", null, h("th", null, "\u59d3\u540d"), h("th", null, "\u624b\u673a\u53f7"), h("th", null, "\u7528\u6237\u540d"), h("th", null, "\u62a5\u540d\u65f6\u95f4"))),
            h("tbody", null, signupList.map(function(s) {
              return h("tr", { key: s.id },
                h("td", null, s.name),
                h("td", null, s.phone),
                h("td", null, s.username || "-"),
                h("td", null, s.createdAt ? s.createdAt.substring(0, 16).replace("T", " ") : "-"));
            }))
          )
        ),
        h("div", { className: "modal-footer" },
          h("button", { className: "btn btn-ghost", onClick: function() { setSignupList(null); } }, "\u5173\u95ed"))
      )
    ),
'''

content = content[:start] + new_section + content[end:]

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")