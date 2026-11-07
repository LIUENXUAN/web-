# -*- coding: utf-8 -*-
"""软著② 智慧营地数字孪生运营平台三维展示系统软件 V1.0 —— 图文软件说明书"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = r"D:\营地 3D大赛\website（最终版）"
SHOT = BASE + r"\软著截图"
OUT = BASE + r"\软著材料-软件说明书-三维展示系统软件V1.0.docx"

SOFT_NAME = "智慧营地数字孪生运营平台三维展示系统软件"
VERSION = "V1.0"
AUTHOR = "刘恩轩"

GREEN = RGBColor(0x2E, 0x6B, 0x3E)
DARK = RGBColor(0x22, 0x22, 0x22)

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
sec.top_margin, sec.bottom_margin = Cm(2.5), Cm(2.5)
sec.left_margin, sec.right_margin = Cm(2.8), Cm(2.8)


def set_font(run, size=12, bold=False, color=DARK, name_cn="宋体"):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name_cn)


def add_title(text, size=20, space_after=10):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_font(r, size=size, bold=True, color=GREEN, name_cn="黑体")
    p.paragraph_format.space_after = Pt(space_after)


def add_h1(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=15, bold=True, color=GREEN, name_cn="黑体")
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(8)


def add_h2(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=13, bold=True, color=DARK, name_cn="黑体")
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(6)


def add_body(text, indent=True):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=12)
    p.paragraph_format.line_spacing = 1.5
    if indent:
        p.paragraph_format.first_line_indent = Pt(24)
    return p


def add_bullet(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=12)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.left_indent = Pt(24)


def add_shot(path, caption):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(path, width=Cm(15.0))
    c = doc.add_paragraph()
    c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = c.add_run(caption)
    set_font(r, size=10, color=GREEN)


def add_table(headers, rows, widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        cell = t.cell(0, j)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        set_font(r, size=11, bold=True, name_cn="黑体")
        shd = cell._element.get_or_add_tcPr().makeelement(qn("w:shd"), {qn("w:val"): "clear", qn("w:fill"): "DCEFDC"})
        cell._element.get_or_add_tcPr().append(shd)
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = t.cell(i + 1, j)
            r = cell.paragraphs[0].add_run(str(val))
            set_font(r, size=11)
    if widths:
        for j, w in enumerate(widths):
            for row in t.rows:
                row.cells[j].width = Cm(w)
    doc.add_paragraph()


# ==================== 封面 ====================
for _ in range(5):
    doc.add_paragraph()
add_title("软件说明书", size=24)
doc.add_paragraph()
cover = [
    ("软件全称", SOFT_NAME),
    ("软件版本", VERSION),
    ("著作权人", AUTHOR),
    ("开发完成日期", "2026年6月"),
    ("文档日期", "2026年9月"),
]
for k, v in cover:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p.add_run(k + "：")
    set_font(r1, size=14, bold=True, name_cn="黑体")
    r2 = p.add_run(v)
    set_font(r2, size=14)
    p.paragraph_format.space_after = Pt(8)
doc.add_page_break()

# ==================== 一、软件概述 ====================
add_h1("一、软件概述")
add_body("智慧营地数字孪生运营平台三维展示系统软件（以下简称本软件）是智慧营地数字孪生运营平台的三维可视化展示子系统，基于 Three.js 三维图形引擎与 GLTF 格式营地实景模型构建，将营地真实地形、水域、道路与建筑布局以三维数字孪生的形式在浏览器中高精度呈现，是平台“数字孪生”能力的核心载体。")
add_body("本软件采用模块化设计：viewer.js 实现三维场景的创建、相机控制、模型加载与渲染管线，campos-motion.js 提供场景交互与视角预设逻辑，model-test.html 为展示页面入口。模型支持高清网页版与极速轻量版双档加载，内置多种视角预设与渲染模式，无需安装任何插件，通过浏览器即可获得沉浸式营地漫游体验。")

# ==================== 二、运行环境 ====================
add_h1("二、运行环境")
add_table(
    ["项目", "要求"],
    [
        ["操作系统", "Windows 10 及以上 / Linux / macOS"],
        ["浏览器", "Chrome 90 及以上、Edge 90 及以上（需支持 WebGL 2.0）"],
        ["运行方式", "本地 HTTP 服务或经平台服务器访问"],
        ["模型文件", "GLTF 格式营地实景模型（高清版/轻量版）"],
        ["服务端口", "三维展示 8897"],
    ],
    widths=[4.0, 11.0],
)

# ==================== 三、软件功能说明 ====================
add_h1("三、软件功能说明")

add_h2("3.1 三维场景加载与展示")
add_body("本软件启动后自动加载营地实景三维模型，模型包含水域、陆地、道路、建筑与营地设施布局，以绿色网格基底呈现数字孪生场景。系统优先加载高清网页模型（约 227 个网格、111 万余三角面）；若高清模型加载缓慢，将自动切换极速轻量版模型，保证不同网络环境下的流畅体验。页面左上角信息面板实时展示模型说明与操作指引。")
add_shot(SHOT + r"\18-三维展示.png", "图 3-1 三维场景总览界面")

add_h2("3.2 视角交互控制")
add_body("本软件支持完整的视角交互控制：鼠标左键拖拽旋转视角、滚轮缩放、右键拖拽平移，键盘 WASD 键实现平面移动视角、Q/E 键升降视角，用户可自由漫游营地的任意区域，从任意角度观察地形与设施细节。")
add_body("系统同时内置多种视角预设，一键切换：总览、鸟瞰、正视、俯视、低角度。鸟瞰视角以俯视角度呈现营地全貌，便于整体把握营地区域划分与空间布局。")
add_shot(SHOT + r"\19-三维展示-鸟瞰.png", "图 3-2 三维场景鸟瞰视角")

add_h2("3.3 渲染模式切换")
add_body("本软件提供多种渲染模式：原材质模式展示模型原始贴图效果；增强渲染模式提升光影与材质表现，呈现更精致的视觉效果；陶土模式以单色材质突出建筑体量与空间结构，便于方案推敲与演示。用户可根据展示场景一键切换。")

add_h2("3.4 模型档位与范围切换")
add_body("软件支持模型档位切换（极速轻量版、高清网页版）与模型范围切换（完整模型、聚焦核心、全景完整），兼顾加载性能与展示细节，满足大屏演示、移动端浏览等不同应用场景的需求。")

# ==================== 四、软件特点 ====================
add_h1("四、软件特点")
add_bullet("数字孪生：营地实景三维模型高精度在线展示，实现空间可视化。")
add_bullet("零插件运行：基于浏览器 WebGL 渲染，无需安装任何插件。")
add_bullet("双档模型：高清/轻量自适应加载，兼顾画质与性能。")
add_bullet("交互丰富：旋转、缩放、平移、WASD 漫游与多视角预设。")
add_bullet("多渲染模式：原材质、增强渲染、陶土模式灵活切换。")

doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("— 说明书完 —")
set_font(r, size=12, color=GREEN)

doc.save(OUT)
print("SAVED:", OUT)
