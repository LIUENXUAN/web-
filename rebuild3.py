import os
cwd = os.getcwd()
print('cwd:', cwd)

with open("src/main/resources/static/visitor-portal.html", "r", encoding="utf-8") as f:
    v = f.read()
vsi = v.find("<style>")
vsei = v.find("</style>", vsi)
css = v[vsi+7:vsei]

with open("后台/admin/employee-portal.html", "r", encoding="utf-8") as f:
    e = f.read()
si = e.find("<script>")
se = e.find("</script>", si)
js = e[si+8:se]

h = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
h += '<meta charset="UTF-8" />\n'
h += '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
h += '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
h += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n'
h += '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
h += '<title>营地公园 · 员工端</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n<div id="app"></div>\n<script>\n' + js + '\n</script>\n</body>\n</html>'

for d in ["src/main/resources/static/employee-portal.html", "后台/admin/employee-portal.html"]:
    with open(d, "w", encoding="utf-8") as f:
        f.write(h)
print("DONE size=" + str(len(h)))
print("Script tags:", h.count("<script>"), h.count("</script>"))
print("Has renderLogin:", "renderLogin()" in h)
print("Title:", h[h.find("<title>")+7:h.find("</title>")])
