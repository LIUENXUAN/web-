# -*- coding: utf-8 -*-
"""软著① 智慧营地数字孪生运营平台软件 V1.0 —— 图文软件说明书
覆盖：后台管理系统 + 游客门户 + 首页 + 前台完整版 + 员工门户
"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = r"D:\营地 3D大赛\website（最终版）"
SHOT = BASE + r"\软著截图"
OUT = BASE + r"\软著材料-软件说明书-智慧营地数字孪生运营平台软件V1.0.docx"

SOFT_NAME = "智慧营地数字孪生运营平台软件"
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
add_body("智慧营地数字孪生运营平台软件（以下简称本软件）是面向中小型营地、景区和研学基地的一体化智慧运营平台，由后台管理系统、游客门户网站、门户首页、前台展示网页与员工门户五大子系统组成，融合三维数字孪生展示、在线预约交易、活动运营、资产巡检、安全告警与经营数据看板等核心功能，帮助营地运营方实现管理线上化、可视化、数据化，为游客提供从浏览、预约到入园体验的全流程数字化服务。")
add_body("本软件采用前后端分离的全栈自研架构。后端基于 Java 21 与 Spring Boot 3.3.2 构建，结合 Spring Security 安全认证、JPA 数据持久化与 MySQL 数据库，提供 RESTful 接口三十余项，覆盖营地区域、订单、活动课程、游客反馈、资产、巡检、告警、用户等业务模块的增删改查与状态流转；前端包含 React 18 单页应用（后台管理与前台展示）、原生 HTML/JS 门户页面与员工工作台，形成“游客浏览预约—后台处理—员工执行—经营复盘”的业务数据闭环。")

# ==================== 二、运行环境 ====================
add_h1("二、运行环境")
add_table(
    ["项目", "要求"],
    [
        ["操作系统", "Windows 10 及以上 / Linux / macOS"],
        ["运行环境", "JDK 21 及以上、Node.js 16 及以上"],
        ["数据库", "MySQL 8.0 及以上"],
        ["前端浏览器", "Chrome 90 及以上、Edge 90 及以上（需支持 WebGL）"],
        ["服务端口", "后端 8080、后台管理 19098、游客门户 19102、员工门户 19101、首页 8899、前台展示 6129"],
    ],
    widths=[4.0, 11.0],
)

# ==================== 三、软件功能说明 ====================
add_h1("三、软件功能说明")

# --- 第一部分：后台管理系统 ---
add_h2("第一部分 后台管理系统")

add_h2("3.1 用户登录")
add_body("本软件采用账号密码登录方式，管理员通过浏览器访问后台管理入口，输入用户名和密码完成身份认证。系统基于 Spring Security 实现会话管理，未登录用户无法访问后台业务页面，登录成功后进入系统仪表盘。默认管理员账号由系统初始化时创建。")
add_shot(SHOT + r"\10-登录页.png", "图 3-1 系统登录界面")

add_h2("3.2 仪表盘")
add_body("仪表盘是系统运营总览首页，聚合展示核心经营指标：今日访客数、预订率、营收金额、资产健康度、告警关闭率与待办事项数量。中部提供本周趋势折线图、区域分布环形图与月度营收柱状图，直观呈现经营走势；下方列表展示最近订单与待处理反馈，帮助管理者快速掌握营地整体运营状况。")
add_shot(SHOT + r"\01-仪表盘.png", "图 3-2 系统仪表盘")

add_h2("3.3 订单管理")
add_body("订单管理模块面向营地预订业务，支持订单列表的分页展示、关键词搜索（客户姓名、手机号、订单号）与状态筛选（待确认、已确认、已完成、已取消）。运营人员可查看订单详情、确认订单、完成订单或取消删除订单，每次状态变更自动写入操作日志。")
add_shot(SHOT + r"\02-订单管理.png", "图 3-3 订单管理界面")

add_h2("3.4 营地区域管理")
add_body("营地区域管理模块维护营地分区信息，包括区域名称、类型（帐篷、木屋、房车、公共）、容量、价格与开放状态。支持新增、编辑、删除区域，以及将区域状态在开放与维护之间切换，实现营地容量与价格的数字化管理，为预订业务提供基础数据支撑。")
add_shot(SHOT + r"\03-营地区域.png", "图 3-4 营地区域管理界面")

add_h2("3.5 活动课程管理")
add_body("活动课程管理模块支持营地活动与课程的全流程管理：发布活动（标题、日期、所属区域、名额上限、介绍）、查看报名名单、切换活动状态（报名中、已满员、已结束、开放）。系统实时统计已报名人数并展示名额进度，为游客端活动报名提供数据支撑。")
add_shot(SHOT + r"\04-活动课程.png", "图 3-5 活动课程管理界面")

add_h2("3.6 游客反馈管理")
add_body("游客反馈管理模块汇集游客通过前台提交的体验反馈，支持查看反馈详情、标记已处理与删除，实现反馈收集、处理、归档的闭环管理，帮助运营方持续改进服务质量。")
add_shot(SHOT + r"\05-游客反馈.png", "图 3-6 游客反馈管理界面")

add_h2("3.7 资产管理")
add_body("资产管理模块建立营地设备设施台账，记录资产名称、所属区域、类型、优先级、健康度与运行状态。支持新增、编辑、删除资产，以及故障上报与恢复操作；健康度以百分比直观展示设备状况，为设备维护与更新决策提供量化依据。")
add_shot(SHOT + r"\06-资产管理.png", "图 3-7 资产管理界面")

add_h2("3.8 巡检管理")
add_body("巡检管理模块支持巡检任务的创建、编辑与删除，配置巡检标题、区域、负责人、频率与截止日期。运营人员可一键执行巡检，系统记录任务状态（待执行、进行中、已完成），实现安全巡检工作的电子化闭环管理。")
add_shot(SHOT + r"\07-巡检管理.png", "图 3-8 巡检管理界面")

add_h2("3.9 告警管理")
add_body("告警管理模块集中展示系统产生的各类安全与设备告警，包括告警标题、所属区域、级别（高、中、低）、类型、发生时间与处理状态。支持告警处理、编辑、关闭与删除，实现告警分级响应与闭环处置，保障营地运营安全。")
add_shot(SHOT + r"\08-告警管理.png", "图 3-9 告警管理界面")

add_h2("3.10 用户管理")
add_body("用户管理模块支持管理员与员工账号的增删改查，管理用户名、显示名、邮箱、角色（管理员、员工、普通用户）与账号状态，实现系统多角色权限控制，保障后台数据安全。")
add_shot(SHOT + r"\09-用户管理.png", "图 3-10 用户管理界面")

# --- 第二部分：游客门户网站 ---
add_h2("第二部分 游客门户网站")

add_h2("3.11 游客中心")
add_body("游客门户是面向游客的预约服务平台，游客通过账号注册登录后进入游客中心。首页概览聚合展示可报名活动数量、开放营地区域数量与已报名活动数量，并分区列出可报名活动（篝火晚会、星空观测、森林徒步等）与开放营地区域（湖畔豪华帐篷、森林木屋套房、至尊野奢帐篷、豪华房车别墅等），展示活动日期、场地、名额剩余与房型价格、容量、状态等关键信息。")
add_shot(SHOT + r"\11-游客门户-首页概览.png", "图 3-11 游客中心首页概览")
add_body("活动课程页面以卡片形式展示全部营地活动课程，包括活动名称、日期、场地、名额剩余与报名状态；处于报名中的活动支持一键报名，名额已满的活动自动置灰并提示不可报名，报名后可在“我的记录”中查看与取消。")
add_shot(SHOT + r"\12-游客门户-活动课程.png", "图 3-12 游客门户活动课程界面")
add_body("营地区域页面展示营地全部房型卡片，标注类型、容量、价格/晚、配套设施与开放状态，游客可据此选择心仪区域完成预订。游玩反馈页面支持游客提交体验反馈，反馈实时进入后台管理系统待处理列表。")
add_shot(SHOT + r"\13-游客门户-营地区域.png", "图 3-13 游客门户营地区域界面")

# --- 第三部分：门户首页 ---
add_h2("第三部分 门户首页")

add_h2("3.12 门户首页")
add_body("门户首页是营地品牌的对外展示窗口，以清新自然的插画风格呈现城市运动公园营地的整体形象，导航包含首页、游客预约、安全闭环、运营看板、3D孪生、联系等栏目，并提供“立即预约”与“查看营地系统”入口，将品牌展示与业务预约有机衔接。")
add_shot(SHOT + r"\14-首页.png", "图 3-14 门户首页界面")

# --- 第四部分：前台完整版 ---
add_h2("第四部分 前台完整版网页")

add_h2("3.13 前台展示网页")
add_body("前台展示网页（Nature Haven Camp）是营地对外宣传与转化的高端展示页，采用 React 构建，首屏展示“相聚·探索·释然”品牌标语与湖畔度假场景，提供 Book Your Stay 预订入口与 3D 漫游入口，并突出私人湖岸、主厨户外餐饮、宠物友好木屋等特色卖点，是营地品牌营销与流量转化的核心载体。")
add_shot(SHOT + r"\15-前台完整版.png", "图 3-15 前台展示网页界面")

# --- 第五部分：员工门户 ---
add_h2("第五部分 员工门户")

add_h2("3.14 员工工作台")
add_body("员工门户是面向一线员工的工作入口，员工以员工账号登录后进入员工工作台。资产管理页面支持营地设备设施的台账查看、新增、编辑、报故障与恢复操作，以健康度进度条直观展示设备状态（正常、待维修）。")
add_shot(SHOT + r"\16-员工门户-资产管理.png", "图 3-16 员工门户资产管理界面")
add_body("巡检管理页面支持巡检任务的查看、新增、编辑与一键执行，展示标题、区域、负责人、频率、截止日期与状态（待执行、已完成），将巡检工作电子化，保障营地安全运营。")
add_shot(SHOT + r"\17-员工门户-巡检管理.png", "图 3-17 员工门户巡检管理界面")

# ==================== 四、软件特点 ====================
add_h1("四、软件特点")
add_bullet("业务闭环：游客浏览预约、后台处理、员工执行、经营复盘全链路数据贯通。")
add_bullet("模块化设计：五大子系统、十余个业务模块独立可维护，扩展性强。")
add_bullet("三维数字孪生：结合营地三维模型展示，实现沉浸式空间预览。")
add_bullet("安全可靠：基于 Spring Security 的认证与多角色权限控制，操作日志全程留痕。")
add_bullet("轻量部署：前端零构建架构，部署成本低，适合中小营地快速落地。")

doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("— 说明书完 —")
set_font(r, size=12, color=GREEN)

doc.save(OUT)
print("SAVED:", OUT)
