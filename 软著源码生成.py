# -*- coding: utf-8 -*-
"""生成软著源代码鉴别材料：全部源代码，每页50行，页眉+页码"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = r"D:\营地 3D大赛\website（最终版）"
SRC = os.path.join(BASE, "src", "main", "java")
OUT = os.path.join(BASE, "软著材料-源代码.docx")

SOFT_NAME = "智慧营地数字孪生运营平台后台管理系统软件"
VERSION = "V1.0"
AUTHOR = "刘恩轩"
LINES_PER_PAGE = 50

# 收集所有 java 文件，按包结构顺序排序（config → controller → domain → dto → repository → service → 入口）
files = []
for root, _, fnames in os.walk(SRC):
    for fn in fnames:
        if fn.endswith(".java"):
            full = os.path.join(root, fn)
            rel = os.path.relpath(full, SRC).replace("\\", "/")
            files.append((rel, full))
files.sort(key=lambda x: x[0])

# 拼接全部代码行
all_lines = []
for rel, full in files:
    with open(full, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    lines = content.splitlines()
    all_lines.extend(lines)
    if all_lines and all_lines[-1] != "":
        all_lines.append("")  # 文件间空行

total_lines = len(all_lines)
total_pages = (total_lines + LINES_PER_PAGE - 1) // LINES_PER_PAGE
print(f"源码总行数: {total_lines}, 每页{LINES_PER_PAGE}行, 共{total_pages}页")

doc = Document()
# 页面设置 A4
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
sec.top_margin, sec.bottom_margin = Cm(2.2), Cm(2.2)
sec.left_margin, sec.right_margin = Cm(2.0), Cm(2.0)

# 页眉：软件名称+版本（居中），页码右对齐放页脚
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
# PAGE 字段
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


def add_code_page(lines, page_no):
    """每页代码：标题行 + 代码行"""
    for ln in lines:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = Pt(13)
        p.paragraph_format.left_indent = Cm(0.2)
        r = p.add_run(ln if ln else " ")
        set_code_run(r, ln if ln else " ")
    # 分页
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run()
    run.add_break(WD_BREAK.PAGE)


# 分页并写入
for i in range(0, total_lines, LINES_PER_PAGE):
    chunk = all_lines[i:i + LINES_PER_PAGE]
    add_code_page(chunk, i // LINES_PER_PAGE + 1)

doc.save(OUT)
print("SAVED:", OUT)
