# -*- coding: utf-8 -*-
"""生成《智慧营地数字孪生运营平台》创业计划书 Word 文档"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn

DOC_PATH = r"D:\营地 3D大赛\website（最终版）\智慧营地数字孪生运营平台-创业计划书.docx"

GREEN = RGBColor(0x2E, 0x6B, 0x3E)
DARK = RGBColor(0x22, 0x22, 0x22)

doc = Document()

# 页面设置 A4
for section in doc.sections:
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.8)


def set_font(run, size=12, bold=False, color=DARK, name_cn="宋体"):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name_cn)


def add_title(text, size=16, color=GREEN, space_after=12):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_font(r, size=size, bold=True, color=color, name_cn="黑体")
    p.paragraph_format.space_after = Pt(space_after)
    return p


def add_h1(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=15, bold=True, color=GREEN, name_cn="黑体")
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(8)
    return p


def add_h2(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=13, bold=True, color=DARK, name_cn="黑体")
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    return p


def add_body(text, indent=True, bold=False):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_font(r, size=12, bold=bold)
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
    return p


def add_table(headers, rows, widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        cell = t.cell(0, j)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        set_font(r, size=11, bold=True, name_cn="黑体")
        # 表头浅绿底
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
    return t


# ==================== 封面 ====================
for _ in range(5):
    doc.add_paragraph()
add_title("智慧营地数字孪生运营平台", size=24)
add_title("创业计划书", size=22)
doc.add_paragraph()
for _ in range(3):
    doc.add_paragraph()
cover_items = [
    ("项目名称", "智慧营地数字孪生运营平台"),
    ("项目类型", "大学生创业项目（创业训练类）"),
    ("所属领域", "信息技术服务业"),
    ("申报学校", "陇东学院"),
    ("团队负责人", "刘恩轩"),
    ("申报日期", "2026年9月"),
]
for k, v in cover_items:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p.add_run(k + "：")
    set_font(r1, size=14, bold=True, name_cn="黑体")
    r2 = p.add_run(v)
    set_font(r2, size=14)
    p.paragraph_format.space_after = Pt(6)
doc.add_page_break()

# ==================== 一、项目概述 ====================
add_h1("一、项目概述")

add_h2("1.1 项目简介")
add_body("本项目是一款面向中小型营地、景区和研学基地的智慧运营管理平台，融合三维数字孪生展示、在线预约交易、活动运营、资产巡检、安全告警与经营数据看板等核心功能，帮助营地运营方实现管理线上化、可视化、数据化，为游客提供便捷的在线预约与活动报名体验。")

add_h2("1.2 产品描述")
add_body("平台采用前后端分离的全栈自研架构，覆盖游客端、运营端和决策端三个入口：")
add_bullet("游客端：以微信小程序和网页为载体，提供营地活动浏览、在线预约、活动报名、反馈提交等功能，并支持营地三维空间沉浸式预览，降低游客决策成本。")
add_bullet("运营端：提供营地区域、订单、活动课程、游客反馈、资产管理、巡检任务、安全告警、用户权限等十大管理模块，实现营地日常运营全流程数字化管理。")
add_bullet("决策端：以数据看板聚合关键经营指标，为管理者提供实时决策依据，形成“游客预约—后台处理—经营复盘”的业务数据闭环。")

add_h2("1.3 用户群体")
add_body("平台主要服务两类用户：一是中小型营地和景区的运营管理方，他们普遍面临预约靠电话、排期靠表格、巡检靠纸质的低效困境，急需低成本、易上手的数字化工具；二是到访营地和计划前往营地的游客，他们需要更便捷、更透明的预约与报名体验。")

add_h2("1.4 项目愿景")
add_body("团队希望以低门槛、轻量化的数字化工具，帮助每一家中小营地摆脱人工管理，让营地运营从经验驱动走向数据驱动，助力文旅数字化建设与乡村振兴。")

# ==================== 二、市场分析 ====================
add_h1("二、市场分析")

add_h2("2.1 行业背景")
add_body("近年来，露营经济持续升温，已成为国内休闲消费与新生活方式升级的重要载体。据艾媒咨询数据，2024年中国露营经济核心市场规模达2139.7亿元，2025年进一步增长至2483.2亿元；央视财经预计2026年核心市场规模将达2919.5亿元，带动上下游市场规模达1.62万亿元。")
add_body("供给端同样快速扩张：企查查数据显示，截至2026年8月，国内现存露营相关企业达29.78万家；行业专家估计全国各类特色露营基地已超过三万个。同时“露营加研学”“露营加游学”等新业态不断涌现，营地从单一的住宿业态向复合型文旅目的地转型，对数字化运营管理的需求日益迫切。")

add_h2("2.2 行业痛点")
add_bullet("管理低效：大量中小营地预约靠电话、登记靠纸质、排期靠表格，人工成本高、易出错。")
add_bullet("容量与安全管控薄弱：营地容量管理凭经验，设备巡检靠人工记录，告警响应不及时，超售与安全隐患频发。")
add_bullet("数据孤岛：前台预订、后台管理、经营分析相互割裂，缺乏统一的数字化决策依据。")
add_bullet("数字化成本高：市面通用软件价格贵、落地重，中小营地难以负担。")

add_h2("2.3 竞争分析")
add_table(
    ["对比维度", "OTA预订平台", "通用企业管理系统", "本项目"],
    [
        ["业务覆盖", "只解决订房/票务预订", "通用流程管理，不懂营地业务", "预订、运营、巡检、告警、决策一体化"],
        ["数字化深度", "无营地内部运营管理", "功能泛化、配置复杂", "贴合营地业务流程，开箱即用"],
        ["成本与部署", "佣金抽成较高", "实施成本高、周期长", "SaaS按年订阅、部署轻量"],
        ["可视化能力", "无", "无", "三维数字孪生沉浸式展示"],
    ],
    widths=[3.0, 4.0, 4.5, 4.0],
)

# ==================== 三、产品与服务 ====================
add_h1("三、产品与服务")

add_h2("3.1 产品架构")
add_body("平台以“三端一体”架构为核心：游客端负责获客与转化，运营端负责日常管理，决策端负责经营分析，三端共用一套数据，业务全链路可追踪。")

add_h2("3.2 核心功能模块")
add_bullet("营地区域管理：营地分区、容量、价格、状态的数字化管理。")
add_bullet("订单管理：在线预订、状态流转（待确认、已确认、已完成、已取消）、关键词与状态筛选、分页查询。")
add_bullet("活动课程管理：活动发布、名额管控、报名进度实时展示。")
add_bullet("游客反馈管理：在线反馈收集与处理闭环。")
add_bullet("资产管理：营地设备台账、健康度评估、维护状态跟踪。")
add_bullet("巡检管理：巡检任务派发、执行、结果记录。")
add_bullet("安全告警管理：告警分级、处理、负责人分配。")
add_bullet("用户权限管理：多角色账号与权限控制。")
add_bullet("三维数字孪生展示：营地空间三维沉浸式预览。")

add_h2("3.3 技术架构")
add_body("后端采用 Spring Boot 3.3.2 与 Java 21，结合 Spring Security 安全认证、JPA 数据持久化与 MySQL 数据库；前端采用 React 18 单页应用架构，零构建、部署轻量；游客端配套微信小程序；三维展示采用 Web 三维渲染技术。系统提供 RESTful API 接口三十余项，覆盖全部业务模块的增删改查与状态流转。")

add_h2("3.4 创新点")
add_bullet("三维数字孪生可视化：将营地三维模型与真实业务数据结合，游客沉浸式预览空间，管理者可视化掌控全局。")
add_bullet("三端业务数据闭环：游客端、运营端、决策端共用一套数据，预约、核销、巡检、告警全链路可追踪。")
add_bullet("全栈自研零构建架构：前端原生 React 加零构建方案，部署轻量、迭代快、成本低，适合中小营地轻量化落地。")
add_bullet("实时经营看板：指挥舱聚合关键经营指标，让“靠经验决策”变为“靠数据决策”。")

# ==================== 四、商业模式 ====================
add_h1("四、商业模式")

add_h2("4.1 收入来源")
add_table(
    ["收入类型", "说明", "定价思路"],
    [
        ["SaaS订阅", "按营地规模分档年费订阅，提供标准功能与技术支持", "基础版低价引流，专业版按规模收费"],
        ["增值服务", "三维建模、定制开发、私有化部署", "按项目报价"],
        ["运营分成", "活动联营、票务分佣", "按流水比例分成"],
    ],
    widths=[3.0, 6.5, 5.5],
)

add_h2("4.2 盈利模式说明")
add_body("以SaaS订阅制为核心，通过标准化产品降低交付成本，实现单客边际成本递减；增值服务提升客单价；运营分成拓展收入天花板。目标客群为中小型营地、景区与研学基地，单客年费低门槛，易于规模化复制。")

# ==================== 五、营销策略 ====================
add_h1("五、营销策略")
add_bullet("渠道合作：与营地行业协会、景区管委会、研学机构建立合作，获取目标客户。")
add_bullet("样板案例：优先在本地（庆阳及周边）打造1至2家标杆营地，以实际运营效果带动口碑传播。")
add_bullet("内容营销：通过短视频平台展示平台三维展示效果与运营效率提升案例。")
add_bullet("低价试用：推出免费试用期或基础版免费策略，降低客户决策门槛。")

# ==================== 六、团队介绍 ====================
add_h1("六、团队介绍")
add_table(
    ["角色", "职责分工", "姓名（待补充）"],
    [
        ["项目负责人", "系统架构、后端开发、项目管理", "刘恩轩"],
        ["前端开发", "管理端单页应用与交互开发", "成员一"],
        ["小程序开发", "游客端微信小程序开发", "成员二"],
        ["三维建模", "营地三维模型与可视化", "成员三"],
        ["产品设计", "界面设计、产品原型", "成员四"],
        ["市场运营", "市场调研、客户对接、商业计划", "成员五"],
    ],
    widths=[3.0, 6.5, 4.0],
)
add_body("团队成员均为在校大学生，具备计算机、软件工程等相关专业背景，已独立完成平台核心系统的研发，具备完整的全栈开发与产品落地能力。", bold=False)

# ==================== 七、实施计划 ====================
add_h1("七、实施计划")

add_h2("7.1 已完成工作")
add_bullet("完成平台核心系统研发：后端API三十余项、数据库九张业务表、管理后台十个功能模块全部实现。")
add_bullet("完成三维营地模型展示与游客端微信小程序原型。")
add_bullet("完成系统演示版本，具备现场可运行、可演示能力。")

add_h2("7.2 分阶段计划")
add_table(
    ["阶段", "时间", "主要任务"],
    [
        ["第一阶段", "2026年9月—12月", "游客端小程序正式上线，完成1至2家营地试点部署运营"],
        ["第二阶段", "2027年1月—6月", "完善商业化功能（在线支付、数据导出、多角色权限），拓展试点客户至5家以上"],
        ["第三阶段", "2027年7月—12月", "产品标准化与定价体系完善，启动区域市场推广，申报软件著作权"],
    ],
    widths=[2.8, 4.5, 7.5],
)

# ==================== 八、财务分析 ====================
add_h1("八、财务分析")

add_h2("8.1 启动资金预算（估算，待团队确认）")
add_table(
    ["支出项目", "金额（元）", "说明"],
    [
        ["服务器与云资源", "5000—8000", "云服务器、域名、对象存储（按年）"],
        ["小程序认证与备案", "500—1000", "微信小程序认证费用"],
        ["三维建模外包", "3000—8000", "营地三维模型制作（可自研降低）"],
        ["市场推广", "3000—5000", "宣传物料、地推、线上推广"],
        ["其他杂项", "2000—3000", "办公、差旅、不可预见费用"],
        ["合计", "13500—25000", "以团队实际预算为准"],
    ],
    widths=[3.5, 3.5, 7.5],
)

add_h2("8.2 收入预测（保守估算）")
add_body("按单营地SaaS年费3000至8000元计算，试点期（第一年）签约3家，年收入约1.5万至2.5万元；规模化期（第二年）签约15家，年收入约8万至12万元；叠加增值服务与运营分成，收入结构逐步多元化。以上为团队初步测算，实际以市场验证为准。")

# ==================== 九、风险分析与对策 ====================
add_h1("九、风险分析与对策")
add_table(
    ["风险类型", "风险描述", "应对措施"],
    [
        ["市场风险", "客户数字化意愿不足、获客周期长", "免费试用降低门槛，打造标杆案例带动口碑"],
        ["技术风险", "功能迭代需求多、技术栈更新快", "模块化架构、持续迭代，保持技术栈轻量"],
        ["运营风险", "团队经验不足、资金有限", "以轻资产运营，优先聚焦区域市场，控制成本"],
        ["政策风险", "文旅政策变化影响行业景气度", "关注政策导向，拓展研学、乡村振兴等多元场景"],
    ],
    widths=[2.8, 5.5, 6.5],
)

# ==================== 十、预期成果 ====================
add_h1("十、预期成果")
add_bullet("完成平台商业化改造，形成可复制、可交付的SaaS产品。")
add_bullet("与1至2家营地或景区达成试点合作，跑通完整商业闭环。")
add_bullet("申报软件著作权1项，积累核心知识产权。")
add_bullet("锻炼团队成员的全栈开发、产品设计与商业运营能力，形成可持续运营的创业团队。")

# 结尾
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("— 以上为本项目创业计划书，欢迎各位评委老师指正 —")
set_font(r, size=12, color=GREEN)

doc.save(DOC_PATH)
print("SAVED:", DOC_PATH)
