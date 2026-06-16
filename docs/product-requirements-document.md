# DeepSleep 产品需求文档（PRD）

> **文档用途**：黑客松 DeepSleep 项目的产品需求定稿。  
> **同步说明**：请将本文档内容复制至飞书 Wiki：[产品需求文档](https://my.feishu.cn/wiki/GDGcwzpuciqBpjkgoCdcLYO2n3c)  
> **当前版本**：v1.6.1 · 2026-06-04

---

## 一、版本信息

| 项目 | 内容 |
|------|------|
| 版本号 | v1.6.1 |
| 创建日期 | 2026-06-04 |
| 最近更新 | 2026-06-04 |
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
| 2026-06-04 | v1.6.1 | 团队 | **取消「行业专项」独立阶段**（行业 addon 并入控制测试）；Scope **继承项目行业/类型**；进度页**6 步阶段条**、抽屉**双状态**、阻塞链**仅有阻塞时展示** |

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
| **控制点 / 任务 ID** | 格式 `DS-{数字}`，如 `DS-201`；Scope 生成或看板新建时自动分配，非固定业务编号 |
| **contributorGroup** | 控制点负责组：`audit` \| `ita` \| `tax` \| `frm` |
| **progressStatus** | 控制点审计进度状态（由工作台材料 + 阶段门禁自动计算，见 §13.5） |
| **工作台** | 单项目内测试执行页：填写测试记录、上传材料、维护复核状态 |
| **进度看板** | 独立「进度」Tab：项目组全员只读查看控制点健康度与分组统计 |

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
2. 独立「进度」导航 Tab（只读）；项目组**全员可查看**，不做角色级权限差异
3. 看板列改为 4 列审计执行状态；卡片标签展示 `auditPhase` / 控制类型 / 负责组
4. `contributorGroup` 模板默认 + owner 覆盖；进度页按 Audit / ITA / Tax / FRM 筛选与分组统计
5. 进度相关界面文案**全中文**（KPI 与 `progressStatus`）

**增强（v1.6.1，本期优化）**

1. 审计阶段固定 **6 步**（与 Scope 流程条一致）；取消独立「行业专项」阶段
2. 行业增量控制点归入 **控制测试**；Scope 生成继承项目锁定 **行业 / 项目类型**
3. 进度页阶段条仅展示 6 步；抽屉并排展示 **执行状态（看板）** 与 **底稿状态（工作台）**
4. **阻塞链预览**仅在存在阻塞控制点时展示

---

## 五、产品定位

| 项目 | 说明 |
|------|------|
| 产品名 | DeepSleep 项目看板 |
| 目标用户 | 四大 **ITA**、**Audit** 团队审计师 |
| 核心价值 | 审计友好的项目创建、跨 Specialist 协作、Scope 生成、测试执行与进度可视 |
| 黑客松形态 | Vite + React 前端原型，数据存浏览器 `localStorage` |
| 仓库 | https://github.com/BenningCool/DeepSleep |

---

## 六、功能架构

```text
DeepSleep
├── 项目列表（v1.5）
│   ├── 模糊搜索、排序
├── 项目创建 / 详情 / 成员管理（v1.5）
│   ├── 客户名称、Specialist、Mock 邀请
├── Scope 初始化（v1.6 · 项目概览内）
│   └── 生成控制点任务 → scopeStatus = defined
├── 看板（v1.6 · 执行层）
│   ├── 4 列执行状态（拖拽）
│   └── Scope 未明确前锁死
├── 工作台（v1.6 · 写入层）
│   ├── 测试记录、会议纪要、测试资料、复核状态
│   └── Scope 未明确前锁死
└── 进度看板（v1.6 · 只读层）
    ├── KPI、阶段条、阻塞关注、控制点列表
    ├── Audit / Specialist 分组筛选
    ├── S4：迷你依赖图（demo 前）
    └── Scope 未明确前锁死
```

**模块数据流**

```text
Scope 生成 → tasks[]
看板（写 task.status）┐
工作台（写 workspaceProgress）├→ workspaceProgressService → 进度看板（只读 snapshot）
阶段门禁规则 ─────────┘
```

---

## 七、功能需求 · 项目列表（v1.5 新增）

### 7.1 列表展示

每张项目卡片展示（至少）：

- 客户名称
- 项目名称
- 团队、Engagement 类型
- 行业
- 计划开始日期 / 报告日（如有）
- Scope 状态、成员数量

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

### 7.3 排序

提供排序下拉或切换按钮：

| 排序项 | 说明 |
|--------|------|
| **默认** | 最近创建（`createdAt` 降序） |
| **按客户名称** | Client Name A→Z（支持中文拼音/ locale 排序或简单字符序） |
| **按行业** | Industry 分组排序 |
| **按年份** | 以计划开始日期的**年份**降序（新的在前） |

排序与搜索**可叠加**：先搜索过滤，再对结果排序。

---

## 八、功能需求 · 项目创建

### 8.1 流程

```text
填写基本信息 + 成员 → 确认创建 → Mock 邀请 → 项目详情页
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
| Scope | **v1.6**：嵌入 Scope 初始化面板（见 §十） |
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
- Audit 成员与 Specialist 分区展示  
- Specialist Lead 视图：仅编辑本组 Staff  
- 删除项目：二次确认  

- 删除项目：二次确认  

### 9.4 项目内导航（v1.6）

进入某项目后，Sidebar 顺序：

```text
项目概览 | 成员管理 | 工作台 | 看板 | 进度
```

| Tab | 读写 | Scope pending 时 |
|-----|------|------------------|
| 项目概览 | 写基本信息；**Scope 初始化入口** | ✅ 可用 |
| 成员管理 | 写成员 / Specialist | ✅ |
| 工作台 | 写测试记录与材料 | 🔒 门禁 |
| 看板 | 写任务执行状态（拖拽） | 🔒 门禁 |
| 进度 | **只读**聚合视图 | 🔒 门禁 |

门禁三 Tab 共用空状态：提示「等待 Scope 明确」，按钮跳转项目概览生成 Scope。

### 9.5 Scope 门禁（v1.6）

`scopeStatus === "pending"` 时，工作台 / 看板 / 进度均不可用；`defined` 后解锁。

---

## 十、功能需求 · Scope 初始化（v1.6）

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
4. Toast：已生成 N 个控制点；解锁工作台 / 看板 / 进度。

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

项目组**全员**可在独立「进度」Tab **只读**查看当前项目的控制点健康度、逾期/阻塞链，以及 Audit vs Specialist 分组进度。数据由 Scope 任务 + 看板操作 + 工作台材料**自动汇聚**；**不需要在进度页拖拽或编辑**。

**权限**：本期不做角色级差异——能访问该项目的成员均可查看进度 Tab。

### 13.2 页面结构（S3 · MVP）

| 区块 | 内容 |
|------|------|
| 负责组筛选 | 全部 / Audit 主责 / ITA 组 / Tax 组 / FRM 组 |
| 顶部 KPI | 总数 / 已完成 / 进行中 / 逾期阻塞（见 §13.4） |
| 阶段条 | **6 步审计阶段**完成率（见 §10.6）；不展示「行业专项」 |
| 逾期/阻塞关注 | 置顶展示 `blockers` 非空的控制点 |
| 控制点列表 | 类型、控制点、负责人、负责组、状态、进度%、阶段 |
| 只读抽屉 | **双状态**（§13.9）、测试摘要、材料、阻塞前置；「去工作台」「去看板」 |

**本期不做**：进度页内编辑材料、拖拽、导出报告、跨项目汇总。

### 13.3 迷你依赖图（S4 · v1.6.1 调整）

- **仅当**当前筛选下存在阻塞控制点时展示「阻塞链预览」。
- 只读；展示阻塞链（建议 ≤15 节点）。
- 节点颜色按 `progressStatus`，`blocked` 优先；边来自阶段门禁前置。
- 点击节点等同列表选中并打开抽屉。

### 13.4 顶部 KPI 口径（全中文）

| 展示文案 | 统计键 | 口径 |
|----------|--------|------|
| **总数** | `total` | 当前筛选下全部控制点 |
| **已完成** | `completed` | `progressStatus === completed` |
| **进行中** | `pending` | `in_progress` / `evidence_submitted` / `pending_review` / `needs_rework` |
| **逾期/阻塞** | `delay` | `blocked`，或已过 `due` 且未完成 |

各负责组（Audit / ITA / Tax / FRM）分组小计使用同一套四字 KPI。

### 13.5 progressStatus 展示文案（全中文 · 已冻结）

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

### 13.6 progressStatus 计算逻辑（摘要）

自动推导，非人工在进度页设置：

1. 存在阶段门禁阻塞 → `blocked`
2. 复核已签核 → `completed`
3. 复核有意见 → `needs_rework`
4. 待复核 → `pending_review`
5. 已上传测试资料 → `evidence_submitted`
6. 有测试文字或会议纪要 → `in_progress`
7. 否则 → `not_started`

### 13.7 接口约定

模块 3 只读：

```js
import {
  getControlProgressSnapshot,
  getControlProgressDetail,
  PROGRESS_STATUS
} from "../../services/workspaceProgressService";
```

详见 `src/modules/progress-board/PROGRESS_API.md`。

### 13.8 其他进度页中文文案

| 场景 | 文案 |
|------|------|
| Tab 名称 | 进度 |
| 页头说明 | 只读**鸟瞰**：自动汇聚 Scope、看板与工作台数据… |
| 阻塞区标题 | 逾期/阻塞关注 |
| Scope 门禁 | 进度看板等待 Scope 明确 / 请先在项目概览中初始化审计范围 |
| 列表列名 | 类型 / 控制点 / 负责人 / 负责组 / 状态 / 进度 / 阶段 |

### 13.9 抽屉双状态（v1.6.1）

进度抽屉须并排展示两套状态，避免与看板混淆：

| 展示标签 | 数据来源 | 含义 |
|----------|----------|------|
| **执行状态（看板）** | `task.status` | 待开始 / 进行中 / 待复核 / 已完成 |
| **底稿状态（工作台）** | `progressStatus` | 未开始 / 测试中 / 资料已获取 / …（§13.5） |

当 `task.status === done` 且 `progressStatus !== completed`（且非 blocked）时，展示提示：**「看板已推进，底稿尚未齐备。」**

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
├── progressStatus              # 见 §13.5
├── progressPercent
├── blockers[], dependencies[]
├── evidenceCount, meetingMinutesCount
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
- [x] 独立「进度」Tab；`ProgressBoardPage`；KPI + 列表 + 阻塞区 + 只读抽屉
- [x] `contributorGroup` 规则 C；分组 KPI；迷你依赖图
- [x] `progressStatus` / KPI 全中文常量（`progressLabels.js`）
- [x] 工作台 MVP（`WorkspacePage` + `workspaceProgressService`）
- [x] Progress API handoff 文档（`PROGRESS_API.md`）

**v1.6.1**

- [x] 取消 `industry-addon` /「行业专项」；行业 addon 归入 `control-test`
- [x] Scope 继承项目行业与项目类型（`scopeProjectMapping.js`）
- [x] 进度阶段条固定 6 步；抽屉双状态；阻塞链按需展示

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
| 8 | **Scope 接入项目详情**，生成任务后 `scopeStatus = defined` |
| 9 | 独立「进度」Tab；**项目组全员可查看**（只读） |
| 10 | Scope pending 时锁死工作台 / 看板 / 进度 |
| 11 | 看板 **4 列执行状态**；卡片标 `auditPhase` / 控制类型 / 负责组 |
| 12 | `contributorGroup`：**模板默认 + owner 覆盖**（C）；ITGC/ITAC→ita 等 |
| 13 | 依赖 MVP：**阶段门禁**；显式 dependencies 后期 |
| 14 | 进度 KPI 与 `progressStatus` 页面展示**全中文**（§13.4–13.5） |
| 15 | 进度看板 S3 列表+阻塞；S4 迷你依赖图 |
| 16 | Partner 邮箱不与 Manager/In-charge 重复 |
| 17 | **审计阶段仅 6 步**；行业 addon 并入 `control-test`，废弃 `industry-addon` |
| 18 | Scope 生成**继承**项目锁定行业/类型，不硬编码 finance |
| 19 | 进度抽屉**并排展示**看板执行状态与底稿 `progressStatus` |
| 20 | 阻塞链预览**仅在有阻塞时**展示 |

---

## 十七、附录

### A. 项目列表示意图（概念）

```
┌─ 项目列表 ─────────────────────────────────────────────┐
│  [ 🔍 搜索客户、项目、行业、成员…          ]              │
│  排序：[ 最近创建 ▼ ]  （客户 / 行业 / 年份）            │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ 某银行股份有限公司          Audit · New Engagement │  │
│  │ 2026 年度财务报表审计                              │  │
│  │ 金融 — Banking · 2026 · Scope Pending · 8 members │  │
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
| Scope 占位 / 门禁 | 项目 Scope 尚未明确 / 等待 Scope 明确 |
| 进度 KPI | 总数 / 已完成 / 进行中 / 逾期/阻塞 |
| 审计阶段（6 步） | Scope 确认 / 风险评估 / 控制设计 / 控制测试 / 缺陷评估 / 项目收尾 |
| progressStatus | 见 §13.5 中文对照表 |
| 负责组筛选 | 全部 / Audit 主责 / ITA 组 / Tax 组 / FRM 组 |

### C. 演示脚本（约 3 分钟）

1. 创建 **Audit** 项目，勾选 **ITA Specialist**
2. **项目概览** → 选 Scope 模板 → **生成 Scope**
3. **看板**：将「风险评估」关键任务拖至 **已完成**
4. **工作台**：对 GITC 控制点上传资料 → **待复核**
5. **进度**：筛选 ITA 组 → 查看 KPI / 逾期阻塞关注 → 抽屉**双状态** → 跳转工作台
6. （有阻塞时）迷你依赖图展示阻塞链

### D. 相关文档

- 协作教程：`docs/github-collaboration-guide.md`
- 模块认领：`docs/module-ownership-guide.md`
- 测试用例：`docs/test-cases-v1.6.md`（含 v1.6.1 增补）
- Progress API：`src/modules/progress-board/PROGRESS_API.md`
- Scope 行业映射：`src/modules/scope-init/scopeProjectMapping.js`
- GitHub：https://github.com/BenningCool/DeepSleep

---

*文档结束 · DeepSleep PRD v1.6.1*
