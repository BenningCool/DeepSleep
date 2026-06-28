# DeepSleep 产品需求文档（PRD）

> **文档用途**：黑客松 DeepSleep 项目的产品需求定稿。  
> **同步说明**：请将本文档内容复制至飞书 Wiki：[产品需求文档](https://my.feishu.cn/wiki/GDGcwzpuciqBpjkgoCdcLYO2n3c)  
> **当前版本**：v1.7.6 · 2026-06-17

---

## 一、版本信息

| 项目 | 内容 |
|------|------|
| 版本号 | v1.7.6 |
| 创建日期 | 2026-06-04 |
| 最近更新 | 2026-06-17 |
| 审核人 | 待定 |
| 状态 | 黑客松 MVP 迭代中 |

---

## 二、变更日志

| 时间 | 版本 | 变更人 | 主要变更内容 |
|------|------|--------|-------------|
| 2026-06-04 | v1.0 | 团队 | 初版：三大模块分工、Scope 初始化方向 |
| 2026-06-04 | v1.1 | 团队 | 明确两步流：基本信息 → Scope 初始化 |
| 2026-06-04 | v1.2 | 团队 | **收窄 MVP**：暂不做 Scope 自动生成；新增 New Engagement / Recurring |
| 2026-06-04 | v1.3 | 团队 | 创建成功进入**项目详情页**；行业清单定稿；看板 Scope 未明确前为空 + 提示 |
| 2026-06-11 | v1.4 | 团队 | Audit 牵头项目支持 **Specialist 团队**（ITA/Tax/FRM）；邀请改回 **Mock**；Scope 初始化 MVP 维持现状 |
| 2026-06-11 | v1.5 | 团队 | 新增**客户名称**；项目列表**模糊搜索**与**排序**（行业/客户/年份） |
| 2026-06-04 | v1.6 | 团队 | **Scope 接入项目详情**；独立**进度** Tab；看板改为审计执行列；**contributorGroup**；进度/工作台**全中文文案**；模块衔接定稿 |
| 2026-06-04 | v1.6.1 | 团队 | **取消「行业专项」独立阶段**（行业 addon 并入控制测试）；Scope **继承项目行业/类型**；进度页**6 步阶段条**、抽屉**双状态** |
| 2026-06-04 | v1.6.2 | 团队 | **需关注事项**仅保留计划逾期与长期未开始；控制点列表 **GITC/ITAC 标签切换**；成员管理 **Specialist team staff** 统一区块；移除独立 Staff 页与阻塞链预览 |
| 2026-06-04 | v1.6.3 | 团队 | 进度页 **Jira 式仪表盘**；**工作台三态环形图**；与工作台 snapshot 对齐（节点进度、milestones、材料）；审计阶段完成按 `workspaceStatus` 统计 |
| 2026-06-04 | v1.6.4 | 团队 | 导航与页头统一为 **进度看板**；需关注分布 **移除双状态不一致统计**；项目列表 **状态概述柱**与看板环形图 **三态同源**（列表横条 / 看板饼图） |
| 2026-06-04 | v1.6.5 | 团队 | **组内成员进度**卡片：改为跟随页顶负责组筛选；「全部」展示 Audit + 已启用 Specialist 全员；底稿指标均来自 **工作台 snapshot** |
| 2026-06-04 | v1.6.6 | 团队 | 进度看板视觉语义增强：三态颜色高对比、状态胶囊加边框；逾期在 KPI/需关注/控制点列表中红色高亮优先提示，面向合伙人/经理鸟瞰决策 |
| 2026-06-16 | v1.6.7 | 团队 | 进度看板 KPI 改为未开始/测试中/已完成/已逾期四态（均来自工作台）；移除摘要区「审计阶段进度」柱与「需关注分布」柱；负责组筛选保留在页顶筛选行 |
| 2026-06-16 | v1.6.8 | 团队 | KPI 视觉增强：四格 SVG 图标与 has-value 色强调；「已逾期」卡片强化（「需跟进」徽章、脉冲外发光、加粗红边、更大数值）；移除控制点列表「负责人筛选」下拉 |
| 2026-06-16 | v1.6.9 | 团队 | **摘要 KPI 四格 + 状态概述图例改为纯展示**（不可点击筛选）；全页三态色板统一（未开始=琥珀警示、测试中=蓝、已完成=绿）；页顶负责组筛选联动 KPI/环形图/需关注 |
| 2026-06-16 | v1.6.10 | 团队 | 进度看板体验迭代：列表/抽屉 **控制点状态 + 节点进度** 重构；**负责人彩色标签**与**负责人筛选**（列表 + 控制点节点进度联动）；抽屉精简并**铺满**右侧列；状态概述/节点进度卡片 **全部/GITC/ITAC** Tab；组内成员进度仅 **In-charge + Staff** |
| 2026-06-16 | v1.6.11 | 团队 | **移除项目概览 Scope 导入与门禁**；控制点清单**完全在工作台维护**（新建测试点）；创建项目后**直达工作台**；项目卡片展示**控制点数量**；列表状态概述柱**全未开始时空心**、仅填充测试中/已完成色段 |
| 2026-06-17 | v1.6.12 | 团队 | 进度看板摘要区：**移除三态环形图**，改为 **测试节点进度** 条形概览（`completedNodes/totalNodes`，全部/GITC/ITAC）；KPI 区标题 **测试点进度** 且四格卡片附 **GITC/ITAC 分布小字**；页面用户可见文案统一为 **测试点**（内部字段仍可为 control）；移除模块辅助说明小字 |
| 2026-06-17 | v1.7.0 | 团队 | **工作台不变**前提下新增全局页 **指挥中心**（View as 演示下拉、跨项目健康度、协作组 pills、搜索/牵头/类型筛选）与 **项目类型**（五类档案卡、查看示例/以此类型创建）；注入演示种子 **PRJ-UAT-DEMO**（Audit 年审+ITA/Tax）与 **PRJ-SOC-DEMO**（ITA-led SOC）；进度看板支持 View as 初始筛选与提示条；项目列表类型皮肤与筛选；创建页 type/team 预填 |
| 2026-06-17 | v1.7.1 | 团队 | 指挥中心 **Staff 模式**改为 **个人工作全景页**：跨项目负荷摘要、当前主攻项目、仅展示参与/有指派项目；每项目展示 Staff 个人测试点三态（非全项目卡） |
| 2026-06-17 | v1.7.2 | 团队 | 指挥中心 **IC / EM 模式**改为 **团队负荷 rollup**：所辖项目成员每人展示饱和度、Focus 项目、测试点统计；支持跳转进度看板并按成员邮箱筛选；团队摘要含高/中负荷人数与 Focus 冲突提示 |
| 2026-06-17 | v1.7.3 | 团队 | **角色模型纠正**：EP/EM **不执行测试**；**Report Date 全员关注**，阈值 **D-30 / D-14 / D-7**；EM 页仅展示执行层 IC/Staff + 管理 Focus；新增 **EP Portfolio 页**（按 EM 分组 + Report 预警）；种子 UAT/SOC Report 调整为 D-6 / D-12 便于演示堆叠 |
| 2026-06-17 | v1.7.4 | 团队 | EP 页重构：**Engagement Risk Matrix** 主视图 + **Attention Queue Top 3**；**Portfolio Health Bar**（nearest report / overdue / RAG 计数）；**Reporting EMs 默认折叠**；四大专业用词（Engagement / Procedures / Fieldwork team） |
| 2026-06-17 | v1.7.5 | 团队 | **EP/EM 管理层统一风格**：中文可读文案（报告日还有 N 天）、统一摘要条/项目表/优先关注/报告日预警；EM 接入 Risk Matrix、**移除底部 project chips**、现场团队默认折叠；**指标说明**折叠区 |
| 2026-06-17 | v1.7.6 | 团队 | **项目页与指挥中心合并**：侧栏单一入口 **项目** + **角色视角 · View as**（含「全部项目」）；默认 **EP** 便于 demo；EP/EM **看板同款外壳**（KPI 四格 + `progress-dashboard-card` + token 统一）；**项目卡片列表**替代 Risk Matrix 主视图；新增 **报告日时间轴**；`EngagementHomePage` / `ManagementCommandBody` |

---

## 三、文档说明

### 3.1 名词解释

| 术语 / 缩略词 | 说明 |
|--------------|------|
| **DeepSleep** | 面向审计团队的项目管理与协作看板（黑客松原型） |
| **ITA** | IT Audit，IT 审计团队 |
| **Audit** | 财务报表审计团队 |
| **Specialist 团队** | Audit 牵头项目中的专家组：ITA team、Tax team、FRM team |
| **Specialist Lead** | 某 Specialist 团队的负责人，角色为 IC / Manager / SM 之一 |
| **客户名称** | Client Name，被审计/服务对象名称（如「某银行股份有限公司」） |
| **Scope** | 审计范围，包括项目边界、控制点与任务清单 |
| **New Engagement** | 新项目 / 首年项目 |
| **Recurring** | 续聘项目 / 滚动项目 |
| **Partner / Manager / In-charge / SM / Staff** | 项目成员角色 |
| **Engagement** | 审计项目（客户委托的一次审计业务） |
| **控制点 / 任务 ID** | 格式 `DS-{数字}`，如 `DS-201`；工作台新建或看板新建时自动分配，非固定业务编号 |
| **contributorGroup** | 控制点负责组：`audit` \| `ita` \| `tax` \| `frm` |
| **progressStatus** | 控制点细粒度审计进度（7 态，由工作台材料 + 阶段门禁计算） |
| **workspaceStatus** | 工作台底稿三态：`not_started` / `in_progress` / `completed`（进度看板 KPI 四格、列表/抽屉主状态、项目列表状态概述柱） |
| **测试点** | 用户界面统称；对应看板 Task / snapshot 中的 control（GITC / ITAC / TASK） |
| **工作台** | 单项目内测试执行页：填写测试记录、上传材料、维护复核状态 |
| **进度看板** | 独立导航 Tab（路由 `progress`）：项目组全员只读查看控制点健康度与分组统计 |

### 3.2 阅读对象

- 产品经理 / 业务方（ITA、Audit 审计师）
- 黑客松开发队友（前端、协作分工）
- 演示与评审评委

---

## 四、需求背景

### 4.1 产品 / 数据现状

当前审计项目管理普遍依赖 **JIRA** 或类似通用研发看板，与审计业务流程不匹配。团队需要一套更贴近四大审计实务、可快速演示协作能力的轻量平台。

### 4.2 用户痛点（vs. JIRA）

| 痛点 | 说明 |
|------|------|
| 里程碑不适配 | 无法贴合财务审计 / IT 审计的阶段与里程碑 |
| 数据模型别扭 | Issue/Epic/Story 面向软件开发，审计天然是「客户 → 控制域 → 测试点 → 底稿」 |
| 多项目视图弱 | 切换项目、看整体进度累，缺少搜索与排序 |
| 配置复杂 | 自定义字段、工作流、权限方案学习成本高 |
| 跨组协作弱 | Audit 牵头拉 ITA/Tax/FRM 专家时，缺乏结构化协作入口 |

### 4.3 竞品：JIRA 可借鉴 vs. 我方策略

| 维度 | JIRA 优势 | DeepSleep 策略 |
|------|----------|----------------|
| 工作流 | 复杂状态流转 | **保留**：关键步骤不可跳过（Scope 明确后） |
| 多项目视图 | 过滤器、仪表盘 | **增强**：项目列表模糊搜索 + 按客户/行业/年份排序 |
| 跨团队协作 | 弱 | **增强**：Audit + Specialist 团队分层邀请 |
| 项目初始化 | 需手工建任务 | **v1.6**：Scope 接入项目详情并生成控制点任务 |
| 查询 | JQL | **后期**：自然语言筛选 |

### 4.4 产品设计策略（黑客松 MVP）

**保留**

1. 审计阶段预设流转路径，关键步骤不可跳过（Scope 明确后生效）
2. 单项目**工作台**（测试执行）+ **进度看板**（全员只读鸟瞰）
3. 项目角色：Partner、Manager、In-charge、Senior Manager、Staff
4. Specialist Lead 后续补充本组 Staff

**收窄（MVP）**

1. 不做真实邮件（**Mock 邀请链接**，避免办公环境 SMTP 权限问题）
2. 不做完整账号体系（链接 + token mock 身份）
3. 主责团队仅 **ITA、Audit**
4. 不做 AI 功能

**增强（v1.5，已实现）**

1. Audit 项目支持 Specialist 团队（ITA / Tax / FRM）
2. 客户名称字段
3. 项目列表模糊搜索与排序

**增强（v1.6，本期）**

1. Scope 初始化接入项目详情，生成带 `auditPhase` / `scopeCritical` / `contributorGroup` 的控制点任务
2. 独立「**进度看板**」导航 Tab（只读）；项目组**全员可查看**，不做角色级权限差异
3. 看板列改为 4 列审计执行状态；卡片标签展示 `auditPhase` / 控制类型 / 负责组
4. `contributorGroup` 模板默认 + owner 覆盖；进度看板按 Audit / ITA / Tax / FRM 筛选与分组统计
5. 进度相关界面文案**全中文**（KPI 与 `progressStatus`）

**增强（v1.6.1，本期优化）**

1. 审计阶段固定 **6 步**（与 Scope 流程条一致）；取消独立「行业专项」阶段
2. 行业增量控制点归入 **控制测试**；Scope 生成继承项目锁定 **行业 / 项目类型**
3. 进度看板阶段条仅展示 6 步；抽屉展示 **控制点状态** 与 **节点进度**（与工作台 snapshot 对齐，§13.10）

**增强（v1.6.2，本期优化）**

1. **需关注事项**仅「计划逾期」「长期未开始」；移除阻塞链预览与前置程序聚合
2. 控制点列表 **GITC / ITAC 标签切换**
3. 成员管理左右分栏；**Specialist team staff** 统一区块；Lead 邀请仅见本组 Staff
4. 移除独立 Specialist Staff 页

---

## 五、产品定位

| 项目 | 说明 |
|------|------|
| 产品名 | DeepSleep 项目看板 |
| 目标用户 | 四大 **ITA**、**Audit** 团队审计师 |
| 核心价值 | 审计友好的项目创建、跨 Specialist 协作、工作台维护控制点、测试执行与进度可视 |
| 黑客松形态 | Vite + React 前端原型，数据存浏览器 `localStorage` |
| 仓库 | https://github.com/BenningCool/DeepSleep |

---

## 六、功能架构

```text
DeepSleep
├── 项目（v1.7.6 · 统一入口）
│   ├── 角色视角 · View as：全部项目 / EP / EM / IC / Staff / Lead
│   ├── 全部项目：模糊搜索、排序、牵头团队/项目类型筛选、类型皮肤
│   └── 管理视角（EP/EM/IC/Staff）：组合 KPI、项目卡片、报告日时间轴、优先关注、报告日预警
├── 项目类型（v1.7 · 展示）
│   ├── 五类档案卡、查看示例、以此类型创建
├── 项目创建 / 详情 / 成员管理（v1.5）
│   ├── 客户名称、Specialist、Mock 邀请、type/team 预填
├── 工作台（v1.6 · 写入层 · v1.6.11 主入口 · **v1.7 不修改**）
│   ├── **新建测试点**维护控制点清单
│   ├── 测试记录、会议纪要、测试资料、复核状态
│   └── 创建项目后默认进入
├── 看板（v1.6 · 执行层）
│   └── 4 列执行状态（拖拽）
└── 进度看板（v1.6 · 只读层 · v1.7 View as 预设）
    ├── KPI、需关注事项、控制点列表（GITC/ITAC 标签）
    └── Audit / Specialist 分组筛选 + View as 提示条
```

**模块数据流**

```text
工作台「新建测试点」/ 看板「新建任务」 → tasks[]
看板（写 task.status）┐
工作台（写 workspaceProgress）├→ workspaceProgressService → 进度看板（只读 snapshot）
阶段门禁规则 ─────────┘
```

---

## 七、功能需求 · 项目页（v1.5 列表 · v1.7.6 统一入口）

全局侧栏入口 **项目**（`EngagementHomePage`）。页顶 **角色视角 · View as** 切换浏览模式与管理模式；选择写入 `sessionStorage`，与进度看板共用。

| View as | 页面行为 |
|---------|----------|
| **全部项目**（浏览） | 原项目列表：卡片点击进入 **项目概览**；支持排序 |
| EP / EM / IC / Staff / Lead | 原指挥中心各角色布局（见 §7.5） |

**Demo 默认**：首次进入（无 session）View as = **EP · Partner**，直接展示组合 KPI + 项目卡片主视图。

### 7.1 列表展示（View as = 全部项目）

每张项目卡片展示（至少）：

- 客户名称
- 项目名称
- 团队、Engagement 类型
- 行业
- 计划开始日期 / 报告日（如有）
- **测试点数量**（footer 仍可能显示「控制点」计数文案）、成员数量（v1.6.11）
- **状态概述柱**（v1.6.4 / v1.6.11）：与进度看板 **KPI 四格同一 `workspaceStatus` 三态口径**；列表为 **横向进度柱**（仅填充测试中/已完成）

### 7.3 状态概述柱（v1.6.4 · v1.6.12）

与 §13 进度看板 **KPI 四格**共用 `computeWorkspaceStatusBreakdown` 口径（**不再**使用环形图）：

| 页面 | 展现 | 数据 |
|------|------|------|
| 项目列表卡片 | 横向进度柱（蓝 / 绿填充；未开始=空心灰轨）+ 三态计数文案 | `workspaceStatus` 三态 |
| 进度看板 KPI | 四格计数 + 占比 | 同上 |
| 进度看板摘要 | **测试节点进度** 三行横条（全部 / GITC / ITAC） | `completedNodes / totalNodes`（§13.2） |

| 场景 | 展示 |
|------|------|
| 0 测试点 | 灰空轨 +「暂无控制点」 |
| 有测试点，**全部未开始** | 灰空轨 + `{total} 控制点` + `未开始 n · 测试中 0 · 已完成 0`（**不填充琥珀色**，v1.6.11） |
| 有测试点，存在测试中/已完成 | 柱体仅填充 **测试中（蓝）** 与 **已完成（绿）** 段；未开始部分留空 |

**不做**：项目列表卡片上展示 TOD/TOE 节点柱。

### 7.2 模糊搜索

列表页顶部提供**搜索框**，对当前用户所有项目做**模糊匹配**。

**可搜索范围（任一命中即展示）**：

| 类别 | 示例 |
|------|------|
| 客户名称 | 「某银行」 |
| 项目名称 | 「2026 年度」 |
| 行业 | 「TMT」「金融」 |
| 团队 / 类型 | 「Audit」「IPO」 |
| 成员邮箱 | 「@kpmg.com」、某人邮箱 |
| Specialist | 「ITA team」「Tax」 |
| 项目 ID | 「PRJ-101」 |

**规则**：

- 不区分大小写
- 多关键词可按空格拆分（可选，MVP 至少支持单串模糊匹配）
- 无结果时展示空状态提示

### 7.4 排序

提供排序下拉或切换按钮：

| 排序项 | 说明 |
|--------|------|
| **默认** | 最近创建（`createdAt` 降序） |
| **按客户名称** | Client Name A→Z（支持中文拼音/ locale 排序或简单字符序） |
| **按行业** | Industry 分组排序 |
| **按年份** | 以计划开始日期的**年份**降序（新的在前） |

排序与搜索**可叠加**：先搜索过滤，再对结果排序。

### 7.5 筛选（v1.7 · v1.7.6）

**全部项目**模式与 **Lead 项目卡**模式共用牵头团队 / 项目类型筛选；全部项目模式额外提供 §7.4 排序。

| 筛选项 | 说明 |
|--------|------|
| **牵头团队** | 全部 / Audit team / ITA team |
| **项目类型** | 全部 + 五类项目类型 |

### 7.6 类型皮肤（v1.7）

每张项目卡片增加：

- 左边 **4px 色条** + 角标缩写（Annual / SOC / IPO…）
- **Audit-led / ITA-led** 标签（来自 `project.team`）

类型仅影响 **展示与演示叙事**，不自动生成不同测试点骨架。

---

## 七点五、功能需求 · 管理视角（v1.7 · v1.7.6）

> 以下各模式通过 **项目** 页顶 View as 进入；**不再**占用独立侧栏「指挥中心」入口。

### 入口与布局（v1.7.6）

- 全局侧栏：**项目 → 项目类型 → 新建项目**
- EP / EM 管理页采用与 **进度看板** 一致的 **`progress-dashboard-card`** 分区外壳 + **KPI 四格**（`StatusKpiCard` / `PortfolioKpiSection`）
- 关注级别 RAG 与进度看板 **workspaceStatus / overdue token 同源**（`portfolioVisualTokens.js`）
- EP/EM 共享布局组件：`ManagementCommandBody.jsx`

**EP/EM 页内区块顺序（自上而下）**

1. 组合 KPI 四格（Critical / Elevated / 30 天内报告 / 逾期程序）
2. **项目卡片列表**（主视图 · `EngagementPortfolioCardList`）
3. 报告日时间轴（未来 90 天 · `ReportTimelineStrip`）
4. 优先关注 Top N（`AttentionQueuePanel`）
5. 报告日预警 · 未来 30 天（`ReportDayPanel`）
6. 指标说明（折叠 · `CommandMetricsLegend`）
7. 折叠区：EP → 下辖 EM；EM → 现场团队工作饱和度

### View as（演示身份）

页顶固定下拉 **角色视角 · View as**（与邮箱无关，演示用）：

| 身份 | 默认关注 |
|------|----------|
| **全部项目** | 浏览全部 engagement，点击进入项目概览 |
| **EP · Partner**（**Demo 默认**） | **Engagement Portfolio Oversight**：KPI 四格 + 项目卡片主视图 + 时间轴 + Attention Queue |
| EM · Manager | **团队管理页**：与 EP 同款 dashboard 外壳；所辖项目卡片；现场团队默认折叠 |
| IC · In-charge | **组内负荷页**：所辖项目 IC/Staff 每人 Focus + 饱和度；Report 预警 |
| Staff | **个人工作全景页**（见下 §Staff 模式） |
| ITA Lead / Tax Lead | 含对应 contributorGroup 测试点的项目优先（项目卡布局） |

选择身份后写入 `sessionStorage`，与进度看板共用。

### 项目卡（只读）

每张卡展示：类型皮肤、客户/项目名、Audit-led/ITA-led、**迷你四态条**（与列表柱同源）、**逾期数**、**报告日 D-xx**、**协作组 pills**（按测试点 `contributorGroup` 实际有数据的组）。

操作：**进度看板**（主） / **概览**（次）。进入进度看板时携带当前 View as 并应用默认筛选。

### 搜索与筛选

复用项目列表模糊搜索 + 牵头团队 + 项目类型筛选。

### 空状态

0 个项目时：主按钮 **新建年审项目**（`type=annual&team=audit`），次链接 **项目类型**。

### Staff 模式 · 个人工作全景（v1.7.1 · 方案 A）

View as = **Staff** 时，指挥中心 **切换为独立布局**（`StaffCommandView`），不再使用 EP/EM 同款项目卡。

**展示范围**：仅「有成员身份 **或** 有指派测试点（`task.owner`）」的项目。

**页顶摘要**

- 整体负荷条（未开始×1 + 测试中×2 + 逾期×3 加权 → 低/中/高）
- 跨项目汇总：指派测试点数、参与项目数、三态 + 逾期计数

**当前主攻（Active Focus）**

- 自动选取：逾期 > 测试中 > 未开始 权重最高的项目
- 高亮卡片 +「当前主攻」徽章

**参与项目列表**

- 每项仅展示 **该 Staff 被指派的测试点** 三态迷你条（非全项目进度）
- 主按钮 **我的测试点** → 进度看板（View as Staff + 负责人筛选）
- 成员但暂无指派：文案「成员身份 · 暂无指派测试点」

实现：`staffWorkloadUtils.js` + `StaffCommandView.jsx`。

### IC / EM 模式 · 团队负荷 Rollup（v1.7.2 · v1.7.3 角色纠正）

View as = **IC** 或 **EM** 时，指挥中心切换为 **团队负荷页**（`TeamRollupCommandView`），与 Staff 个人页、EP Portfolio 均不同。

**Report Date 预警（v1.7.3 · 全员）**

| 档位 | 条件 | 视觉 |
|------|------|------|
| 过期 | 报告日已过 | 红 |
| D-7 | ≤ 7 天 | 红 |
| D-14 | ≤ 14 天 | 琥珀 |
| D-30 | ≤ 30 天 | 灰 |
| 未填 | 无 reportDate | 紫 |

14 天内 ≥2 个项目 Report 堆叠时提示 last minute 风险。

**所辖项目判定**

| 视角 | 条件 |
|------|------|
| IC | `project.members` 中 `in_charge` = 当前演示邮箱 |
| EM | `project.members` 中 `manager` = 当前演示邮箱 |

**可见成员（执行层 only · v1.7.3）**

| 视角 | Roster |
|------|--------|
| IC / EM | 所辖项目上的 **In-charge + Staff**（**不含 Manager / Partner**） |

EM 本人为 **管理角色**，页顶展示 **管理 Focus**（Report 临近 + 执行层逾期加权），不参与测试点执行。

**每人一行（Person 快照）**

- 负荷 % / 低中高（与 Staff 同一算法，跨项目汇总）
- **当前 Focus** 项目（客户 · 项目名）
- 测试点：总数、未开始/测试中/逾期
- **查看测试点** → 进度看板并 **按该成员邮箱筛选**（`ownerFilterOverride`）

**团队摘要**：执行层人数、高/中负荷人数、执行层逾期总数；EM 另展示 30 天内 Report 数与 D-14 堆叠；若多人 Focus 同一项目则提示资源争抢。

**底部**：~~所辖项目 chip~~（v1.7.5 已移除）；所辖项目改由 **项目卡片列表** 展示。

实现：`reportDayUtils.js` + `ReportDayPanel.jsx` + `ReportTimelineStrip.jsx` + `teamRollupUtils.js` + `TeamRollupCommandView.jsx` + `ManagementCommandBody.jsx`。

### EP 模式 · Engagement Portfolio Oversight（v1.7.4 · v1.7.6 卡片主视图）

View as = **EP** 时，切换为 **Portfolio Oversight 页**（`EpCommandView` + `ManagementCommandBody`）。

**组合 KPI 四格**（v1.7.6）：Critical engagements / Elevated / 30 天内报告 / 逾期程序合计；附组合摘要（项目数 · 下辖 EM 数）。

**项目卡片列表（主视图 · v1.7.6 替代 Risk Matrix 表）**

每张卡：关注级别 pill（需立即关注 / 需重点关注 / 持续跟踪 / 进展正常）、客户/项目名、Reporting EM、报告日可读文案、逾期 badge、**测试点进度条**（与列表 `WorkspaceStatusOverviewBar` 同源）。操作：**项目进度** / **项目概览**。

**报告日时间轴（v1.7.6）**：横轴为距报告日天数；点大小表示逾期程序数；支持 14 天内 Report 堆叠带；点击 marker 进入项目进度。

**Attention Queue · Top 3**：从组合评分取前 3 项需关注 engagement。

**Report Date Watchlist**：未来 30 天；空态显示 nearest report 提示。

**Reporting EMs**：**默认折叠**，展开后展示 EM 卡片（fieldwork team / overdue / report clustering）。

实现：`epPortfolioUtils.js` + `EngagementPortfolioCardList.jsx` + `PortfolioKpiSection.jsx` + `ManagementCommandBody.jsx` + `AttentionQueuePanel.jsx` + `reportTimelineUtils.js`。

---

## 七点六、功能需求 · 项目类型页（v1.7）

五张 **Engagement Type** 档案卡，每张含：Primary team、Typical collaboration、Progress focus、英文 tagline、类型主题色。

| 操作 | 行为 |
|------|------|
| **查看示例** | `annual`/`ipo` → `PRJ-UAT-DEMO`；`soc`/`special-it`/`privacy` → `PRJ-SOC-DEMO`（副线注明 ITA 主导范式） |
| **以此类型创建** | 跳转创建页并预填 `projectType` + 默认 `team`（annual/ipo→audit；soc/special-it/privacy→ita） |

---

## 七点七、演示种子项目（v1.7）

首次启动幂等注入（`deepsleep-demo-seed-v1`）：

| ID | 叙事 | 要点 |
|----|------|------|
| **PRJ-UAT-DEMO** | Audit 年审 + ITA/Tax | 15 条演示测试点、ITA+Tax Specialist、Report **D-6**、部分逾期/测试中 |
| **PRJ-SOC-DEMO** | ITA-led SOC | 0～2 条 ITA 测试点、Report **D-12**（与 UAT 形成 14 天内堆叠演示） |

**原则**：工作台页面与写入逻辑 **不修改**；种子仅写 `projects` / `tasks` / 可选 workspace progress。

---

## 七点八、进度看板 View as（v1.7）

进入进度看板时根据 View as 设置 **初始** 负责组/负责人筛选（用户可手动修改）：

| View as | 负责组 | 负责人 |
|---------|--------|--------|
| EP / EM | 全部 | 全部 |
| IC | Audit（audit 项目）或 ITA（ita 项目） | 全部 |
| Staff | 全部 | staff1.uat@firm.com |
| ITA Lead | ITA | 全部 |
| Tax Lead | Tax | 全部 |

页顶 **提示条** + **恢复视角默认** 按钮。

---

## 八、功能需求 · 项目创建

### 8.1 流程

```text
填写基本信息 + 成员 → 确认创建 → Mock 邀请 → 工作台（v1.6.11 起默认入口）
```

### 8.2 基本信息字段

| 字段 | 必填 | 类型 | 创建后是否可改 |
|------|------|------|----------------|
| 团队 | ✅ | ITA \| Audit | ❌ 锁定 |
| 项目性质 | ✅ | New Engagement \| Recurring | ❌ 锁定 |
| 项目类型 | ✅ | 5 类 | ❌ 锁定 |
| 行业 | ✅ | 见 8.4 | ❌ 锁定 |
| **客户名称** | ✅ | 文本 | ✅ **可改** |
| 项目名称 | ✅ | 文本 | ✅ 可改 |
| 计划开始日期 | ✅ | 日期 | ✅ 可改 |
| 项目报告日 | ❌ | 日期 | ✅ 可改（选填，可后补） |

**客户名称说明**

- 界面文案：`Client Name / 客户名称`
- 示例：「某某银行股份有限公司」「ABC Technology Ltd.」
- 与**项目名称**区分：客户是主体，项目名称是 engagement 描述（如「2026 年度财务报表审计」）

### 8.3 项目类型（5 类）

1. 年度财务报表审计
2. 专项 IT 审计
3. IPO 核查
4. SOC 1 / SOC 2 审计
5. 个人信息保护合规审计

### 8.4 行业清单

> 粒度：MVP 不过细。文案：**中英混合**。

（行业枚举同 v1.3，共约 24 项：金融、制造、零售、TMT、医药、能源等，详见原表。）

### 8.5 主责项目成员

与现有一致：

| 角色 | 必填 | 说明 |
|------|------|------|
| Partner | ✅ | 邮箱独立，不与 Manager/In-charge 重复 |
| Manager | ✅ | 可与 In-charge 相同 |
| In-charge | ✅ | 项目负责人 |
| Senior Manager | ❌ | 选填 |
| Staff | ❌ | 多个，无上限 |

### 8.6 Audit 专属：Specialist 团队（v1.4）

**仅当团队 = Audit** 时展示此区块；**ITA 团队创建项目不出现**。

可选勾选以下 Specialist 团队（可多选）：

| Specialist | 说明 |
|------------|------|
| **ITA team** | IT 审计专家组 |
| **Tax team** | 税务专家组 |
| **FRM team** | 金融风险相关专家组 |

每个勾选的 Specialist 须指定：

| 字段 | 必填 | 说明 |
|------|------|------|
| 负责人角色 | ✅ | `In-charge` \| `Manager` \| `Senior Manager` 三选一 |
| 负责人邮箱 | ✅ | 该专家组 Lead 邮箱 |

**创建后流程（Mock）**

1. 为 Audit 成员 + 各 Specialist Lead 生成 Mock 邀请链接  
2. Specialist Lead 通过链接进入项目  
3. Lead **仅可填写本组 Staff 邮箱**（Audit 管理员也可代填）  
4. 保存后为新增 Staff 生成 Mock 邀请  

**创建后仍可修改**：在「成员管理」中可增删 Specialist 团队、修改 Lead 角色/邮箱；取消勾选将移除该组；更换 Lead 邮箱将清空该组 Staff 并重新生成邀请链接。

**Specialist 邀请模板补充（示例）**

```text
【中文】
您已被邀请作为 {ITA/Tax/FRM} team 的 {IC/Manager/SM} 加入项目「{项目名称}」。
客户：{客户名称}
请登录并补充本组 Staff：{url}

【English】
You have been invited as {Role} for the {Team} specialist group on "{Project Name}".
Client: {Client Name}
Please join and add your team staff: {url}
```

### 8.7 邀请机制（Mock，不发真实邮件）

| 项目 | 说明 |
|------|------|
| 真实 SMTP | **不使用**（演示环境权限不稳定） |
| 行为 | 生成邀请链接，界面展示 + 可复制 |
| 模板 | 固定模板，**中英双语** |
| 成员变更 | 新增 / 修改 / 删除；删除即 revoke 权限 |

---

## 九、功能需求 · 项目详情页

### 9.1 概览展示

| 区块 | 内容 |
|------|------|
| 客户名称 | Client Name（可编辑） |
| 项目名称 | 可编辑 |
| 锁定信息 | Team、Engagement、Type、Industry |
| 日期 | Start Date、Report Date（可编辑） |
| 测试点清单 | **v1.6.11**：引导区块，展示控制点数量；按钮 **前往工作台** / 查看看板 / 查看进度看板 |
| 成员 | 分区：Audit 成员 / 各 Specialist 团队 |

### 9.2 可编辑 vs 锁定

| 可编辑 | 锁定 |
|--------|------|
| 客户名称、项目名称 | 团队 |
| Start Date、Report Date | 项目性质、项目类型、行业 |
| 全部成员邮箱（含 Specialist） | — |
| Specialist 团队配置 | 可增删改：勾选/取消 ITA·Tax·FRM，修改 Lead 角色与邮箱 |

### 9.3 成员管理

- 独立「成员管理」导航入口  
- **左栏**：编辑核心成员 → Specialist 团队配置（Audit）→ **Specialist team staff**（统一父区块）  
- **右栏**：核心成员邀请、Specialist Lead 邀请、Specialist team staff 邀请  
- Audit 项目已勾选的专家组（ITA / Tax / FRM）均在 **Specialist team staff** 下补充 Staff；管理员可见多组，每组以「Tax Staff」等标签区分（无单独「ITA team」子标题）  
- Specialist Lead 通过邀请链接进入后：顶部提示本组身份，**仅展示本组** Staff 表单  
- 删除项目：二次确认  

### 9.4 项目内导航（v1.6）

进入某项目后，Sidebar 顺序：

```text
项目概览 | 成员管理 | 工作台 | 看板 | 进度看板
```

| Tab | 读写 | 说明（v1.6.11） |
|-----|------|----------------|
| 项目概览 | 写基本信息；**测试点清单引导** | 始终可用 |
| 成员管理 | 写成员 / Specialist | 始终可用 |
| 工作台 | 写测试记录与材料；**新建测试点** | 始终可用；**创建项目后默认进入** |
| 看板 | 写任务执行状态（拖拽） | 始终可用 |
| 进度看板 | **只读**聚合视图 | 始终可用 |

### 9.5 控制点清单维护（v1.6.11）

- **主入口**：工作台 **「新建测试点」**（类型 GITC/ITAC、标题、负责人、首节点预计完成日）。
- **项目概览**：不再提供 Scope 批量生成；仅展示当前控制点数量与跳转工作台。
- **看板**：仍可通过 **新建任务** 补充任务（通用入口）。
- 新建任务默认 `auditPhase: control-test`、`scopeGenerated: false`。
- 旧版 `ProjectScopeSection` / Scope 门禁代码保留在仓库但**不再接入主流程**。

---

## 十、功能需求 · Scope 初始化（v1.6 · v1.6.11 起非主流程）

> **v1.6.11 变更**：Scope 批量导入已从项目概览移除；本节保留历史口径与 `scope-init` 模块参考，**演示与验收以 §9.5 工作台维护为准**。

### 10.1 入口与预填

- **位置**：项目详情页 Scope 区块，嵌入 `ProjectScopeSection`（精简版）。
- **预填只读**：项目创建时已锁定的团队、行业、项目类型、客户名称、项目名称。
- **用户可选**：审计领域（ITGC / ITAC / …）、关键系统、快速模板、默认负责人（默认 In-charge 邮箱）。
- **行业继承（v1.6.1）**：生成 Scope 时读取 `project.industry` / `project.projectType`，经 `resolveScopeIndustry()` / `resolveScopeProjectType()` 映射后传入 `generateScopeTasks`；**不再硬编码** `finance` / `annual`。

### 10.2 生成行为

点击「生成 Scope」后：

1. 调用 `generateScopeTasks`，写入当前项目的 `tasks[]`（合并/替换同项目旧 scope 任务）。
2. 每条任务须包含：`projectId`、`auditPhase`、`scopeCritical`、`scopeGenerated: true`、`contributorGroup`（见 §11.3）。
3. 设置 `project.scopeStatus = "defined"`。
4. Toast：已生成 N 个控制点；解锁工作台 / 看板 / 进度看板。

### 10.3 任务 ID 规则

- 格式：`DS-{数字}`（如 `DS-201`），自增分配，**非固定业务含义**。
- 界面展示建议：**控制点标题（DS-xxx）**，阻塞提示示例：  
  `访问管理控制测试（DS-205）— 被阻塞：等待「IT 风险评估」（DS-198）完成`。

### 10.4 依赖关系（MVP）

- **阶段门禁**：同项目内，更早 `auditPhase` 的 `scopeCritical` 任务未完成（`task.status !== done`）时，后续控制点 `progressStatus = blocked`。
- **后期**：Scope 模板支持显式 `dependencies: ["DS-202"]`。

### 10.5 行业与项目类型继承（v1.6.1）

Scope 生成**不得**硬编码行业或项目类型，须从项目锁定字段读取：

| 项目字段 | Scope 使用方式 |
|----------|----------------|
| `project.industry` | 经 `scopeProjectMapping.resolveScopeIndustry()` 映射为 Scope 行业 key |
| `project.projectType` | 经 `resolveScopeProjectType()` 映射为 Scope 项目类型 key |

**行业映射规则（前缀）**：

| 项目行业前缀 | Scope 行业 key | 行业增量任务示例 |
|--------------|----------------|------------------|
| `finance-` | `finance` | 监管报送与核心系统专项 |
| `mfg-` | `manufacturing` | ERP 与生产系统集成控制 |
| `retail-` | `retail` | POS 与电商订单对账 |
| `tmt-` | `tech` | CI/CD 与云资源配置审查 |
| `healthcare-` | `healthcare` | 临床试验与患者数据隔离 |
| `energy-` | `energy` | OT/IT 边界与工控安全 |
| 其他 / 未映射 | — | **不生成**行业增量任务（仍生成领域基础任务） |

**项目类型映射**：`annual` / `special-it`→`special` / `ipo` / `soc` / `privacy`→`special`。

实现文件：`src/modules/scope-init/scopeProjectMapping.js`。

### 10.6 审计阶段（6 步 · v1.6.1 已冻结）

界面与进度阶段条**仅展示以下 6 步**（与 `WORKFLOW_STEPS` 一致）：

| `auditPhase` | 中文 |
|--------------|------|
| `scope-confirm` | Scope 确认 |
| `risk-assessment` | 风险评估 |
| `control-design` | 控制设计 |
| `control-test` | 控制测试 |
| `deficiency-review` | 缺陷评估 |
| `wrap-up` | 项目收尾 |

**行业增量任务**（原 `industry-addon`）归入 `control-test`，不再单独占阶段条。

**兼容**：历史数据 `auditPhase === "industry-addon"` 加载时迁移为 `control-test`（`normalizeAuditPhase`）。

---

## 十一、功能需求 · 看板（v1.6）

### 11.1 列定义（方案 B · 已冻结）

看板列改为 **4 列审计执行状态**（替换原研发列「需求梳理 / 设计 / 开发」）：

| 列 id | 中文列名 | 说明 |
|-------|----------|------|
| `todo` | 待开始 | 未着手 |
| `doing` | 进行中 | 测试执行中 |
| `review` | 待复核 | 等待复核 |
| `done` | 已完成 | 本控制点执行完成 |

Scope 模板生成任务的默认 `status` 为 `todo`（不再使用 `grooming`）。

### 11.2 卡片标签（不占列）

每张卡片展示：

- `auditPhase`（Scope 确认 / 风险评估 / 控制测试 / …）
- 控制类型：`GITC` / `ITAC` / `TASK`（由标题/领域推断）
- `contributorGroup`：Audit 主责 / ITA 组 / Tax 组 / FRM 组
- `scopeCritical` 时显示「关键」标记

### 11.3 contributorGroup（方案 C · 已冻结）

**取值**：`audit` | `ita` | `tax` | `frm`

| 层 | 时机 | 规则 |
|----|------|------|
| **模板默认** | Scope 生成时 | ITGC 基础任务 → `ita`；ITAC / 应用控制类 → `ita`；税务勾稽 → `tax`；FRM 相关 → `frm`；统筹类（Scope 确认、风险评估、缺陷评估、收尾等）→ `audit` |
| **Owner 覆盖** | 修改 `owner` 时 | 若邮箱命中某 Specialist 的 lead/staff → 覆盖为对应组；否则回退模板默认 |

**优先级**：owner 推断 > 模板默认。

### 11.4 拖拽规则

沿用 `scopeRules`：

- 关键步骤（`scopeCritical`）不可跳列推进。
- 前置关键任务未完成时，不可推进当前任务。
- 看板拖拽更新的是 `task.status`（执行状态），**不是**进度看板上的 `progressStatus`。

### 11.5 与 progressStatus 的关系

| 字段 | 维护方式 | 用途 |
|------|----------|------|
| `task.status` | 看板拖拽 | 执行列位置 |
| `auditPhase` | Scope 生成时固定 | 卡片标签、阶段门禁（6 步，§10.5） |
| `progressStatus` | `workspaceProgressService` 自动计算 | 进度 Tab、工作台进度 pill |

**双状态说明（v1.6.1）**：看板 `task.status` 表示执行里程碑推进；工作台推导的 `progressStatus` 表示底稿完备度。二者可暂时不一致；进度页抽屉并排展示，看板 `done` 而底稿未完成时提示「看板已推进，底稿尚未齐备」。

---

## 十二、功能需求 · 工作台（v1.6）

### 12.1 定位

单项目内 **测试执行工作台**（非跨项目个人首页）。项目组全员可进入；**写入**测试与材料数据。

### 12.2 功能范围

| 能力 | 说明 |
|------|------|
| 控制点清单 | 来自当前项目 `tasks`，可按负责人筛选 |
| 测试记录 | Objective / Procedure / Sample / Result |
| 材料 | 上传会议纪要、测试资料（演示为元数据记录） |
| 复核 | 复核状态、复核意见 |
| 保存 | 写入 `deepsleep-workspace-progress-v1`，触发 `progressStatus` 重算 |

### 12.3 与进度看板衔接

- 工作台**不写**进度百分比逻辑；保存后由 `workspaceProgressService.deriveProgressStatus()` 自动更新。
- 进度看板通过 `getControlProgressSnapshot` / `getControlProgressDetail` 只读消费，不 import 工作台页面、不直读 localStorage。

### 12.4 顶部统计（工作台）

| 文案 | 口径 |
|------|------|
| 测试项 | 控制点总数 |
| 被阻塞 | `progressStatus === blocked` |
| 待复核 | `reviewStatus === pending_review` |
| 已完成 | `progressStatus === completed` |

---

## 十三、功能需求 · 进度看板（v1.6）

### 13.1 产品目标

项目组**全员**可在独立「**进度看板**」Tab **只读**查看当前项目的测试点健康度、逾期风险，以及 Audit vs Specialist 分组进度。**测试点状态、节点进度、测试节点进度概览、组内成员进度** 均来自 `workspaceProgressService` 工作台 snapshot；看板 `task.status` **不在进度看板抽屉展示**（v1.6.10）。**不需要在进度看板内拖拽或编辑**。

**权限**：本期不做角色级差异——能访问该项目的成员均可查看进度看板 Tab。

### 13.2 页面结构（v1.6.12 · 摘要仪表盘 + 明细）

| 区块 | 内容 |
|------|------|
| 负责组筛选 | 全部 / Audit 主责 / ITA 组 / Tax 组 / FRM 组（联动 KPI、测试节点进度、需关注、列表；**不**受负责人筛选影响） |
| **测试点进度（KPI 四格）** | 区块标题「测试点进度」；四格：**未开始 / 测试中 / 已完成 / 已逾期**（均来自 `workspaceStatus` 与计划完成日）；每格附 **GITC / ITAC 数量及占该格比例** 小字；逾期待上游同步时显示 `—`；**纯展示，不可点击** |
| **测试节点进度** | 三行横条：**全部 / GITC / ITAC**；每行 `completedNodes/totalNodes · 节点完成度% · N 测试点`；数据来自 snapshot 节点完成度（**非** workspaceStatus 三态） |
| **近期动态** | 按 `updatedAt` 展示最近保存的测试点（当前节点、TOD/TOE、**负责人彩色标签**） |
| **底部双卡** | 左：**组内成员进度**（§13.11）；右：**测试点节点进度**（§13.13） |
| **视觉语义** | 未开始=琥珀、测试中=蓝、已完成=绿；逾期=红；KPI / 状态 pill / 成员柱 **同色同源**（§13.12） |
| 需关注事项 | **计划逾期**、**长期未开始**（见 §13.3）；负责人以彩色标签展示 |
| 测试点列表 | Tab：**全部 · N** / GITC · N / ITAC · N / 其他（如有）；**负责人筛选**（§13.14）；列见 §13.4 |
| 只读抽屉 | **测试点状态** + **节点进度**（与列表一致）+ 工作台摘要 + 材料；**铺满**右侧列高度（§13.10） |

**v1.6.12 移除**：摘要区 **workspaceStatus 三态环形图** 及图例（由 **测试节点进度** 条形概览替代）。

**本期不做**：进度看板内编辑材料、拖拽、导出报告、跨项目汇总、外部图表库依赖、模块级「双状态不一致」统计、抽屉内展示看板执行状态 / 前置程序 / 字段复核 / 测试摘要（v1.6.10 已移除）。

### 13.3 需关注事项（v1.6.2 · v1.6.3 口径对齐）

仅当存在命中项时展示：

| 类型 | 口径 |
|------|------|
| **计划逾期** | `due < 今天` 且 `workspaceStatus !== completed` |
| **长期未开始** | 看板 `status === todo` 且 `workspaceStatus === not_started`，并满足：项目开始 ≥14 天仍未启动，**或** 距 `due` ≤7 天仍未启动 |

列表条目状态 pill 展示 **工作台三态**。点击条目选中并打开抽屉。

> 数据预留（v1.6.6）：计划完成日解析支持 `task.due`、`control.plannedDue`、`control.dueDate`、`task.plannedDue`、`task.dueDate`。当当前筛选范围内暂无可计算计划完成日时，KPI 与需关注区显示「待同步」提示，待上游字段接入后自动生效。

### 13.4 测试点列表（v1.6.10 · v1.6.12 文案）

- 列表标题旁 Tab：**全部 · N** / **GITC · N** / **ITAC · N** / **其他 · N**（有非 GITC/ITAC 时）  
- **负责人筛选**下拉：与「测试点节点进度」卡片联动（§13.14）；选项含全部成员、当前负责组名册、未分配  
- 列：**测试点** / **负责人**（彩色 pill）/ **负责组** / **测试点状态** / **节点进度**  
- **测试点状态**列：主展示 `workspaceStatus`（三态 pill）；`progressStatus` 与三态不一致且非 blocked 时以小字补充  
- **节点进度**列（与抽屉一致）：  
  - 第一行：`当前 · {节点名}` 或 `已完成 · {末节点名}`（来自 snapshot `currentNodeLabel`）  
  - 第二行：**大号百分比** + `completed/total · TOD x/y · TOE x/y`  
  - 底部：**蓝色进度条**（全部完成时变绿）  
- **不展示**：审计阶段列、列表行内「被阻塞」标签（v1.6.10）  

### 13.5 摘要 KPI 口径（v1.6.7 · v1.6.12 布局）

| 展示文案 | 口径 |
|----------|------|
| **未开始** | `workspaceStatus === not_started` |
| **测试中** | `workspaceStatus === in_progress` |
| **已完成** | `workspaceStatus === completed` |
| **已逾期** | 计划完成日已过期且 `workspaceStatus !== completed`；无计划完成日数据时显示 `—` 占位 |

KPI 四格**仅作鸟瞰展示**，不触发列表筛选或页面布局联动（v1.6.9）；数据**仅来自工作台 snapshot**，不读取看板执行状态。

**KPI 卡片布局（v1.6.12）**：

- 区块标题：**测试点进度**
- 卡片结构：SVG 图标 | 状态标题 +（逾期且有值时 **需跟进** 徽章）| **GITC / ITAC 分布小字** | 大号数字 + 占比
- 三态卡片副标题「测试点」；**已逾期**卡片在无可解析计划完成日时不显示副标题
- 有计数时启用对应色强调（`has-value`），零计数为 idle；无 hover 选中态

### 13.6 progressStatus 展示文案（全中文 · 细态）

内部枚举定义于 `workspaceProgressService.js` 的 `PROGRESS_STATUS`，**内部值不改**，仅统一页面 label：

| 内部值 | 页面展示 |
|--------|----------|
| `not_started` | 未开始 |
| `in_progress` | 测试中 |
| `evidence_submitted` | 资料已获取 |
| `pending_review` | 待复核 |
| `needs_rework` | 待补充测试 |
| `completed` | 已完成 |
| `blocked` | 被阻塞 |

实现时抽成**单一常量**供工作台、进度看板共用。

### 13.7 progressStatus 计算逻辑（摘要 · 实现口径）

自动推导，非人工在进度页设置。当前 `workspaceProgressService` **实际返回**的分支为：

1. 存在阶段门禁阻塞 → `blocked`
2. 复核有退回意见 → `needs_rework`
3. 全部 required 节点完成且字段复核均为 `accepted` → `completed`
4. 已提交复核，或执行节点已全部完成但未完成复核 → `pending_review`
5. 有工作台输入但 `completedNodes === 0` → `in_progress`
6. 无任何输入 → `not_started`
7. 其他进行中 → `in_progress`

> `evidence_submitted` 等细态枚举**保留在常量与文案**中供未来扩展，**当前 service 不产出**该值。进度看板列表/抽屉**主展示 `workspaceStatus` 三态**。

### 13.8 接口约定

模块 3 只读：

```js
import {
  getControlProgressSnapshot,
  getControlProgressDetail,
  PROGRESS_STATUS
} from "../../services/workspaceProgressService";
```

详见 `src/modules/progress-board/PROGRESS_API.md`。

### 13.9 其他进度看板中文文案

| 场景 | 文案 |
|------|------|
| Tab 名称 | **进度看板** |
| 页头 eyebrow | Progress Board · 项目进度看板 |
| 需关注区标题 | 需关注事项 |
| 无测试点 | 暂无测试点，请在工作台新建测试点或调整筛选条件 |
| 列表列名 | 测试点 / 负责人 / 负责组 / **测试点状态** / **节点进度** |
| 负责人展示 | 全页 **彩色 pill 标签**（同一邮箱固定配色，§13.14） |
| 负责人筛选 | **负责人筛选** 下拉 + **清除**（列表与节点进度卡片联动） |

### 13.10 抽屉（v1.6.10 · 精简 · 铺满）

选中测试点后，右侧抽屉与左侧列表**等高铺满**；内容区可滚动，底部操作按钮固定。

| 区块 | 内容 |
|------|------|
| 标题区 | 类型标签、标题、ID、**负责人彩色标签** |
| 状态区 | **测试点状态**：`workspaceStatus` 三态 pill；细态差异时小字补充 |
| 状态区 | **节点进度**：与列表 **节点进度** 列**完全一致**（当前节点、百分比、计数、进度条） |
| 不一致提示 | 看板已推进但底稿未齐备时单行黄字（若 `isBoardProgressMismatch`） |
| 工作台摘要 | 计划完成日；**节点预计完成日**：按工作台 `phases[].nodes` 顺序**列出全部节点**及 `YYYY-MM-DD`（无则 `—`） |
| 材料 | 制度 / 纪要 / 支持性材料 / SPP / 测试资料等计数 |
| 操作 | **去工作台**（主按钮）、**去看板**、**刷新** |

**v1.6.10 已移除**：执行状态（看板）、前置程序未完成、字段复核、测试摘要、Planning/Review milestones 展示。

### 13.11 组内成员进度（v1.6.5 · v1.6.10 口径）

替换原「负责组工作量」组级完成率条。

| 项 | 口径 |
|----|------|
| 数据来源 | `getControlProgressSnapshot` → `workspaceStatus` 三态 |
| 成员范围（v1.6.10） | 仅 **In-charge + Staff**（Audit）；Specialist 组仅 **Staff**（不含 Lead） |
| Team 标签 | **无**（跟随页顶负责组筛选） |
| 「全部」 | 各组执行层成员（IC + Staff）去重及其名下测试点 |
| 选定某组 | 该组执行层成员 + 对应 `contributorGroup` 测试点 |
| 成员行 | 成员名以 **负责人彩色标签** 展示；按测试点总数降序 |
| 柱图 | 填充 = 已完成占比；辅文为三态明细 |
| 未分配 | `owner` 为空时单独一行 |

### 13.13 测试点节点进度卡片（v1.6.10 · v1.6.12 文案）

原「控制类型分布」改为按**测试点**展示节点完成度：

| 项 | 说明 |
|----|------|
| 卡片标题 | **测试点节点进度** |
| Tab | 全部 / GITC / ITAC |
| 每行 | 类型标签、测试点标题、**负责人彩色标签**、`completed/total · percent%`、进度条 |
| 负责人筛选 | 卡片标题旁下拉，与列表 **联动**（§13.14） |
| 排序 | 完成度升序（便于发现滞后项） |

### 13.14 负责人彩色标签与筛选（v1.6.10）

| 项 | 说明 |
|----|------|
| 配色 | 按负责人邮箱哈希分配 **8 色调色板**（`progressOwnerUtils.js`）；同一邮箱全页颜色固定 |
| 未分配 | 灰色 pill |
| 覆盖范围 | 列表负责人列、抽屉标题、近期动态、需关注事项、组内成员进度、测试点节点进度 |
| 负责人筛选 | 两处入口：**测试点列表**表头、**测试点节点进度**卡片；共享 `ownerFilter` 状态 |
| 筛选影响 | 测试点列表、测试点节点进度卡片、近期动态（`detailControls`） |
| 筛选不影响 | KPI 四格、**测试节点进度**概览、组内成员进度、需关注事项（仍仅受页顶负责组筛选） |
| 切换负责组 | 若当前选中负责人不在新组名册内，自动清除负责人筛选 |

### 13.12 视觉优先级（v1.6.6–v1.6.9）

面向合伙人/经理的鸟瞰使用场景，状态需“一眼可辨”：

| 层级 | 规则 |
|------|------|
| 三态主色（全页统一） | `workspaceStatus`：**未开始=琥珀 `#ff991f`** / 测试中=蓝 `#0052cc` / 已完成=绿 `#00875a`；KPI 四格、状态 pill、成员柱 共用 `progressVisualTokens.js`（v1.6.9） |
| KPI 图标 | 四格均使用 SVG 语义图标（时钟/进度弧/对勾/警告三角） |
| 逾期优先级 | 逾期（红 `#de350b`）高于其他状态展示；在列表行与关注事项中可覆盖默认中性色背景 |
| KPI「已逾期」强提示（v1.6.8） | 有计划完成日且 `overdue > 0`：8px 深红左边框、红橙渐变底、脉冲外发光、数值放大、右上角 **「需跟进」** 徽章 |
| KPI「已逾期」idle | 有计划完成日但零逾期：仍保持橙红预警边框与图标，区别于三态 idle |
| KPI「已逾期」占位 | 无可解析计划完成日时显示 `—`，弱化样式，附「待同步」说明 |
| 交互 | KPI 四格**不可点击**；页顶负责组 chip + **负责人筛选**（列表/节点进度卡片，§13.14） |
| 一致性 | 状态 pill、KPI、成员进度辅文、测试点列表行遵循统一色板 |
| **测试节点进度条** | 使用蓝/绿渐变表示节点完成度（与三态 KPI **不同指标**） |
| 数据来源 | 颜色映射基于工作台 snapshot 字段（`workspaceStatus` / 逾期判定），非手工标注 |

---

## 十四、数据模型（概念 · v1.6）

```text
Project
├── id                          # PRJ-xxx
├── clientName
├── name
├── team                        # ita | audit
├── engagementType
├── projectType
├── industry
├── startDate
├── reportDate
├── scopeStatus                 # pending | defined
├── members[]
├── specialistTeams[]           # 仅 Audit
├── createdAt
│
Task（看板 / Scope 生成）
├── id                          # DS-xxx
├── projectId
├── title, description, owner, due
├── status                      # todo | doing | review | done（v1.6 看板列）
├── auditPhase                  # scope-confirm | risk-assessment | ...
├── scopeCritical
├── scopeGenerated
├── contributorGroup            # audit | ita | tax | frm
├── scopeMeta
│
WorkspaceProgress（按 controlId / taskId）
├── testContent                 # objective, procedure, sampleInfo, result
├── materials[]                 # meeting_minutes | evidence
├── reviewStatus
├── reviewComment
│
Snapshot（只读 · 进度看板）
├── progressStatus              # 见 §13.6
├── workspaceStatus             # 三态（列表「控制点状态」）
├── progressPercent
├── completedNodes / totalNodes
├── phaseProgress               # { tod, toe }
├── currentNodeId / currentNodeLabel / currentNodePhaseId / currentNodePhaseLabel
├── allNodesComplete
├── blockers[]
├── nodeDueDates                # 抽屉节点预计完成日
├── evidenceCount, meetingMinutesCount, policyCount, ...
```

---

## 十五、MVP 交付清单

### 15.1 已完成

**v1.3–v1.5**

- [x] 项目创建、详情、成员管理、Mock 邀请
- [x] 客户名称、列表搜索与排序
- [x] Audit Specialist 团队 + Lead 填 Staff
- [x] Scope 占位 + 空看板提示
- [x] 删除项目（二次确认）

**v1.6**

- [x] Scope 接入项目详情（`ProjectScopeSection`）；`projectId` 绑定；`scopeStatus = defined`
- [x] 看板 4 列 + 卡片标签；Scope 默认 `status = todo`
- [x] 独立「进度」Tab；`ProgressBoardPage`；KPI + 列表 + 需关注区 + 只读抽屉
- [x] `contributorGroup` 规则 C；分组 KPI
- [x] `progressStatus` / KPI 全中文常量（`progressLabels.js`）
- [x] 工作台 MVP（`WorkspacePage` + `workspaceProgressService`）
- [x] Progress API handoff 文档（`PROGRESS_API.md`）

**v1.6.1**

- [x] 取消 `industry-addon` /「行业专项」；行业 addon 归入 `control-test`
- [x] Scope 继承项目行业与项目类型（`scopeProjectMapping.js`）
- [x] 进度阶段条固定 6 步；抽屉双状态

**v1.6.2**

- [x] 需关注事项：计划逾期 + 长期未开始（`ProgressAttentionPanel`）
- [x] 控制点列表 GITC / ITAC 标签切换
- [x] 成员管理左右分栏；Specialist team staff 统一区块；Lead 仅见本组
- [x] 移除 `SpecialistStaffPage`、`MiniDependencyGraph`

**v1.6.3**

- [x] 进度页 Jira 式摘要仪表盘（`ProgressDashboard`）
- [x] 工作台三态环形图 + 负责组/类型/风险分布卡片
- [x] 列表与抽屉对齐 `workspaceStatus`、节点进度 TOD/TOE
- [x] 工作台 TOD/TOE 页面（`f2ae6ac`）与 `PROGRESS_API.md` 对齐

**v1.6.4**

- [x] 导航 / 面包屑 / 页眉统一为 **进度看板**
- [x] 需关注分布移除 **双状态不一致** 柱（保留抽屉单行提示）
- [x] 项目列表 **状态概述柱**（`projectProgressOverview.js` + `ProjectCardProgress`）

**v1.6.7**

- [x] KPI 四格：未开始 / 测试中 / 已完成 / 已逾期（`ProgressDashboard` + `computeDashboardKpis`）
- [x] 移除摘要区「审计阶段进度」与「需关注分布」柱图卡片

**v1.6.8**

- [x] KPI 四格 SVG 图标与 `has-value` / idle 色强调
- [x] 「已逾期」KPI 强化：「需跟进」徽章、脉冲外发光、加粗红边
- [x] 移除控制点列表「负责人筛选」下拉

**v1.6.9**

- [x] 摘要 KPI 四格 + 状态概述图例改为纯展示（移除三态/逾期点击筛选）
- [x] 全页三态色板统一（`progressVisualTokens.js` + CSS 变量；未开始=琥珀警示）
- [x] 页顶负责组联动 KPI / 环形图 / 需关注 / 列表

**v1.6.10**

- [x] 控制点列表：列名 **控制点状态**；移除阶段列；Tab **全部/GITC/ITAC/其他**
- [x] 节点进度：当前工作台节点 + 百分比 + 进度条（列表与抽屉一致）
- [x] 抽屉精简（移除看板执行状态、前置程序、字段复核、测试摘要）；节点预计完成日全量列表；**铺满**右侧列
- [x] **负责人彩色标签**（`ProgressOwnerLabel` + `progressOwnerUtils` 8 色调色板）
- [x] **负责人筛选**联动（`ProgressOwnerFilter`：列表 + 控制点节点进度卡片）
- [x] 状态概述 Tab：全部/GITC/ITAC；控制点节点进度卡片替换原控制类型分布
- [x] 组内成员进度：仅 In-charge + Staff（Specialist 不含 Lead）
- [x] 底部布局：左组内成员进度、右控制点节点进度

**v1.6.11**

- [x] 移除项目概览 **Scope 导入**与 **Scope 门禁**（工作台 / 看板 / 进度看板始终可用）
- [x] 创建项目后**默认进入工作台**；概览改为 **测试点清单引导**
- [x] 项目卡片 footer：**控制点数量**（替代 Scope Pending/Defined）
- [x] 列表状态概述柱：**全未开始时空心**；仅填充测试中/已完成色段（`WorkspaceStatusOverviewBar`）

**v1.6.12**

- [x] 进度看板摘要区：**测试节点进度** 三行横条（全部/GITC/ITAC，`completedNodes/totalNodes`）替代 **三态环形图**
- [x] KPI 区标题 **测试点进度**；四格附 **GITC/ITAC 分布** 小字（`computeTypeSplitForControls`）
- [x] 进度看板用户可见文案统一为 **测试点**（列表/抽屉/KPI/卡片标题）
- [x] 移除进度看板/项目列表/侧栏等 **模块辅助说明小字**（`page-lead` / `panel-note` 引导文案）

**v1.7.6**

- [x] **项目页统一入口**（`EngagementHomePage`）：侧栏 **项目**；View as 含 **全部项目**；Demo 默认 **EP**
- [x] EP/EM **看板同款 dashboard 外壳**（`ManagementCommandBody` + `DashboardSection` + `StatusKpiCard`）
- [x] **项目卡片列表**替代 EP/EM Risk Matrix 表（`EngagementPortfolioCardList`）
- [x] **报告日时间轴**（`ReportTimelineStrip` + `reportTimelineUtils.js`）
- [x] 关注级别与进度看板 **visual token 统一**（`portfolioVisualTokens.js` + `COMMAND_CENTER_LABELS`）
- [x] EM 接入与 EP 同款布局；现场团队 / 下辖 EM 默认折叠（`CollapsibleSection`）

### 15.2 待开发

（暂无 · 下一迭代待定）

### 15.3 本期仍不做

- 跨项目个人工作台、进度页拖拽/写材料、真实权限（Specialist 只看本组）
- 显式 dependencies 手工连边（后期 Scope 模板）
- AI、真实邮件、Tax/Cyber 主责团队

---

## 十六、决策记录（已冻结 · 至 v1.6.1）

| # | 决策 |
|---|------|
| 1 | 一项目一主责团队（ITA / Audit） |
| 2 | 客户名称必填，创建后可改 |
| 3 | 项目列表模糊搜索 + 按客户/行业/年份排序 |
| 4 | Audit 可添加 Specialist：ITA / Tax / FRM |
| 5 | Specialist Lead 填本组 Staff；创建后可增删改 Specialist |
| 6 | ITA 创建项目无 Specialist 区块 |
| 7 | 邀请统一 Mock |
| 8 | ~~Scope 接入项目详情~~ → **v1.6.11**：控制点在工作台维护 |
| 9 | 独立「**进度看板**」Tab；**项目组全员可查看**（只读） |
| 10 | ~~Scope pending 锁死三 Tab~~ → **v1.6.11 已取消门禁** |
| 11 | 看板 **4 列执行状态**；卡片标 `auditPhase` / 控制类型 / 负责组 |
| 12 | `contributorGroup`：**模板默认 + owner 覆盖**（C）；ITGC/ITAC→ita 等 |
| 13 | 依赖 MVP：**阶段门禁**；显式 dependencies 后期 |
| 14 | 进度 KPI 与 `progressStatus` 页面展示**全中文**（§13.4–13.5） |
| 15 | 进度看板 S3 列表+阻塞；S4 迷你依赖图 |
| 16 | Partner 邮箱不与 Manager/In-charge 重复 |
| 17 | **审计阶段仅 6 步**；行业 addon 并入 `control-test`，废弃 `industry-addon` |
| 18 | Scope 生成**继承**项目锁定行业/类型，不硬编码 finance |
| 19 | 进度抽屉展示 **测试点状态 + 节点进度**（v1.6.10）；看板执行状态不在抽屉展示 |
| 21 | **v1.6.11**：测试点清单在工作台维护；概览 Scope 导入与三 Tab 门禁已移除 |
| 22 | **v1.6.11**：列表状态概述柱全未开始时空心，不填充琥珀色 |
| 23 | **v1.6.12**：进度看板摘要用 **测试节点进度条** 替代三态环形图；KPI 附 GITC/ITAC 分布 |

---

## 十七、附录

### A. 项目列表示意图（概念）

```
┌─ 项目 · View as [ 全部项目 ▼ ] ──────────────────────────┐
│  [ 🔍 搜索客户、项目、行业、成员…          ]              │
│  排序：[ 最近创建 ▼ ]  牵头团队 / 项目类型               │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ 某银行股份有限公司          Audit · New Engagement │  │
│  │ 2026 年度财务报表审计                              │  │
│  │ 状态概述  [空心灰轨]  10 控制点                  │  │
│  │ 未开始 10 · 测试中 0 · 已完成 0                   │  │
│  │ 10 控制点 · 4 members                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### B. 界面文案速查（v1.6.1）

| 场景 | 文案 |
|------|------|
| 客户名称 | Client Name / 客户名称 |
| 搜索占位 | 搜索客户、项目、行业或成员… |
| 邀请成功 | 已生成邀请链接（演示模式，未发送邮件） |
| Specialist | Specialist Teams / 专家组 |
| 测试点清单 | 前往工作台维护控制点 / 尚未添加控制点 |
| 导航 Tab | **进度看板** |
| 列表状态概述 | 与进度看板 **KPI 四格** `workspaceStatus` 三态一致；列表柱**仅填测试中/已完成**；全未开始=空心灰轨 |
| 进度 KPI | 测试点进度：未开始 / 测试中 / 已完成 / 已逾期（附 GITC/ITAC 小字） |
| 进度摘要 | **测试节点进度** 横条（全部/GITC/ITAC） |
| 审计阶段（6 步） | Scope 确认 / 风险评估 / 控制设计 / 控制测试 / 缺陷评估 / 项目收尾 |
| progressStatus | 见 §13.5 中文对照表 |
| 负责组筛选 | 全部 / Audit 主责 / ITA 组 / Tax 组 / FRM 组 |

### C. 演示脚本（约 3 分钟）

1. 创建 **Audit** 项目，勾选 **ITA Specialist** → 自动进入 **工作台**
2. **工作台** → **新建测试点**（GITC / ITAC）若干条
3. **看板**：将某任务拖至 **已完成**（若有阶段门禁任务）
4. **工作台**：对 GITC 控制点上传资料 → **待复核**
5. **进度看板**：筛选 ITA 组 → 查看 KPI / 需关注 → **负责人筛选** → 抽屉节点进度
6. **项目列表**：确认状态概述柱在全未开始时为**空心灰轨**

### D. 相关文档

- 协作教程：`docs/github-collaboration-guide.md`
- 模块认领：`docs/module-ownership-guide.md`
- 测试用例：`docs/test-cases-v1.6.md`（含 v1.6.1 增补）
- Progress API：`src/modules/progress-board/PROGRESS_API.md`
- Scope 行业映射：`src/modules/scope-init/scopeProjectMapping.js`
- GitHub：https://github.com/BenningCool/DeepSleep

---

*文档结束 · DeepSleep PRD v1.6.12*
