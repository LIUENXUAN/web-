# -*- coding: utf-8 -*-
"""软著① 智慧营地数字孪生运营平台软件 V1.0 —— 合并系统源代码鉴别材料
覆盖：后台管理系统(Java) + 游客门户 + 首页 + 前台完整版 + 员工门户
规则：每页50行；总页数>60 时提交前30页+后30页（各连续30页）
说明：前端压缩构建产物(main-DLaq7rxc.js 等)与第三方库(React/Three/Draco)不纳入鉴别材料
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = r"D:\营地 3D大赛\website（最终版）"
OUT = os.path.join(BASE, "软著材料-源代码-智慧营地数字孪生运营平台软件V1.0.docx")

SOFT_NAME = "智慧营地数字孪生运营平台软件"
VERSION = "V1.0"
AUTHOR = "刘恩轩"
LINES_PER_PAGE = 50
FRONT_PAGES = 30
BACK_PAGES = 30


def collect_java():
    files = []
    src = os.path.join(BASE, "src", "main", "java")
    for root, _, fnames in os.walk(src):
        for fn in fnames:
            if fn.endswith(".java"):
                files.append(os.path.join(root, fn))
    files.sort()
    return files


def read_lines(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read().splitlines()


# 有序文件清单：后端 Java（config→controller→…→入口）→ 游客门户 → 首页 → 前台完整版 → 员工门户
FRONT = r"前台\前台网页_完整版\可直接运行版"
file_paths = collect_java() + [
    os.path.join(BASE, "游客门户", "index.html"),
    os.path.join(BASE, "游客门户", "start-visitor.cjs"),
    os.path.join(BASE, "首页", "index.html"),
    os.path.join(BASE, FRONT, "index.html"),
    os.path.join(BASE, FRONT, "bloom-admin.html"),
    os.path.join(BASE, FRONT, "assets", "bloomAdmin-DJ6i0_H4.js"),
    os.path.join(BASE, FRONT, "assets", "main-gUAyAZav.css"),
    os.path.join(BASE, FRONT, "assets", "bloomAdmin-BUhvVHef.css"),
    os.path.join(BASE, "员工门户", "index.html"),
    os.path.join(BASE, "员工门户", "start-employee.cjs"),
]

all_lines = []
for p in file_paths:
    lines = read_lines(p)
    all_lines.extend(lines)
    if all_lines and all_lines[-1] != "":
        all_lines.append("")

total_lines = len(all_lines)
total_pages = (total_lines + LINES_PER_PAGE - 1) // LINES_PER_PAGE
print(f"源码总行数: {total_lines}, 每页{LINES_PER_PAGE}行, 共{total_pages}页")

if total_pages > FRONT_PAGES + BACK_PAGES:
    head = all_lines[: FRONT_PAGES * LINES_PER_PAGE]
    tail = all_lines[-(BACK_PAGES * LINES_PER_PAGE):]
    keep = head + tail
    note = f"总页数{total_pages}页，按软著规则提交前{FRONT_PAGES}页+后{BACK_PAGES}页共{FRONT_PAGES + BACK_PAGES}页"
else:
    keep = all_lines
    note = f"总页数{total_pages}页，不足{FRONT_PAGES + BACK_PAGES}页全部提交"
print(note)

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
sec.top_margin, sec.bottom_margin = Cm(2.2), Cm(2.2)
sec.left_margin, sec.right_margin = Cm(2.0), Cm(2.0)

header = sec.header
hp = header.paragraphs[0]
hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
hr = hp.add_run(f"{SOFT_NAME} {VERSION}")
hr.font.size = Pt(9)
hr.font.name = "Times New Roman"
hr._element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")

footer = sec.footer
fp = footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
fr = fp.add_run("第 ")
fr.font.size = Pt(9)
run = fp.add_run()
fld1 = OxmlElement("w:fldChar"); fld1.set(qn("w:fldCharType"), "begin")
instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve"); instr.text = "PAGE"
fld2 = OxmlElement("w:fldChar"); fld2.set(qn("w:fldCharType"), "end")
run._r.append(fld1); run._r.append(instr); run._r.append(fld2)
run.font.size = Pt(9)
fr2 = fp.add_run(" 页")
fr2.font.size = Pt(9)


def set_code_run(r, text):
    r.font.size = Pt(9)
    r.font.name = "Courier New"
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")
    r.font.color.rgb = RGBColor(0, 0, 0)


for i in range(0, len(keep), LINES_PER_PAGE):
    chunk = keep[i:i + LINES_PER_PAGE]
    for ln in chunk:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = Pt(13)
        p.paragraph_format.left_indent = Cm(0.2)
        r = p.add_run(ln if ln else " ")
        set_code_run(r, ln if ln else " ")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run()
    run.add_break(WD_BREAK.PAGE)

doc.save(OUT)
print("SAVED:", OUT)
