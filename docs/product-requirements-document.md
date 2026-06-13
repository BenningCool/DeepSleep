# DeepSleep 产品需求文档（PRD）

> **文档用途**：黑客松 DeepSleep 项目的产品需求定稿。  
> **同步说明**：请将本文档内容复制至飞书 Wiki：[产品需求文档](https://my.feishu.cn/wiki/GDGcwzpuciqBpjkgoCdcLYO2n3c)  
> **当前版本**：v1.5 · 2026-06-11

---

## 一、版本信息

| 项目 | 内容 |
|------|------|
| 版本号 | v1.5 |
| 创建日期 | 2026-06-04 |
| 最近更新 | 2026-06-11 |
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
| 项目初始化 | 需手工建任务 | **后期**：Scope 自动生成（MVP 仅占位） |
| 查询 | JQL | **后期**：自然语言筛选 |

### 4.4 产品设计策略（黑客松 MVP）

**保留**

1. 审计阶段预设流转路径，关键步骤不可跳过（Scope 明确后生效）
2. 个人工作台方向：「我负责的、今天到期的、被阻塞的」
3. 项目角色：Partner、Manager、In-charge、Senior Manager、Staff
4. Specialist Lead 后续补充本组 Staff

**收窄（MVP）**

1. 不做真实邮件（**Mock 邀请链接**，避免办公环境 SMTP 权限问题）
2. 不做完整账号体系（链接 + token mock 身份）
3. 主责团队仅 **ITA、Audit**
4. **Scope 初始化维持现状**（占位，不自动生成任务）
5. 不做 AI 功能

**增强（本期 v1.5）**

1. Audit 项目支持 Specialist 团队（ITA / Tax / FRM）
2. 客户名称字段
3. 项目列表模糊搜索与排序

---

## 五、产品定位

| 项目 | 说明 |
|------|------|
| 产品名 | DeepSleep 项目看板 |
| 目标用户 | 四大 **ITA**、**Audit** 团队审计师 |
| 核心价值 | 审计友好的项目创建、跨 Specialist 协作、项目检索与 Scope 管理 |
| 黑客松形态 | Vite + React 前端原型，数据存浏览器 `localStorage` |
| 仓库 | https://github.com/BenningCool/DeepSleep |

---

## 六、功能架构

```text
DeepSleep
├── 项目列表（本期）
│   ├── 模糊搜索（项目名称、客户、行业、成员等）
│   └── 排序（行业 / 客户 / 年份）
├── 项目创建（本期）
│   ├── 基本信息（含客户名称）
│   ├── 主责团队成员
│   ├── Audit：Specialist 团队（可选）
│   └── Mock 邀请 → 项目详情页
├── 项目详情 / 成员管理（本期）
│   ├── 可编辑：项目名称、客户名称、日期、成员
│   ├── Specialist Lead 填本组 Staff
│   └── Scope 占位 + 删除项目
├── 看板（Scope 未明确前为空 + 提示）
├── Scope 初始化（MVP 维持现状，后期）
├── 个人工作台（后期）
└── 依赖可视化（后期）
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
| Scope | 占位 Pending |
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

### 9.4 看板（方案 A）

Scope 未明确前：空看板 + 提示「请先在项目详情中明确 Scope」。

---

## 十、功能需求 · Scope 初始化

> **MVP 维持现状**：详情页 Scope 区仅占位文案，不触发任务生成。  
> 后期再按 `团队 × 项目类型 × 行业` 做约 80% 自动初始化。

---

## 十一、数据模型（概念 · v1.5）

```text
Project
├── id
├── clientName              # 客户名称（新增）
├── name                    # 项目名称
├── team                    # ITA | Audit
├── engagementType
├── projectType
├── industry
├── startDate
├── reportDate              # 选填
├── scopeStatus             # pending | defined
├── members[]               # 主责团队成员
│   ├── email, role, inviteToken, status
├── specialistTeams[]       # 仅 Audit 项目（新增）
│   ├── team                # ita | tax | frm
│   ├── leadRole            # in_charge | manager | sm
│   ├── leadEmail
│   ├── inviteToken
│   ├── status              # pending_staff | active
│   └── staff[]
│       ├── email, inviteToken, status
├── createdAt
└── tasks[]                 # Scope 明确后
```

---

## 十二、MVP 交付清单（v1.5 更新）

### 12.1 已完成（v1.3 代码）

- [x] 项目创建表单（团队、Engagement、类型、行业、成员）
- [x] 项目详情页 + 成员管理
- [x] Mock 邀请（曾接 SMTP，**v1.5 改回纯 Mock**）
- [x] Scope 占位 + 空看板提示
- [x] 删除项目（二次确认）

### 12.2 待开发（v1.5）

- [ ] **客户名称**字段（创建 + 详情可编辑 + 列表展示）
- [ ] **项目列表模糊搜索**
- [ ] **项目列表排序**（客户 / 行业 / 年份 / 默认）
- [ ] **Audit Specialist 团队**（ITA/Tax/FRM + Lead + Staff 流程）
- [ ] **移除/降级真实邮件依赖**（演示路径不依赖 SMTP）
- [ ] Specialist Lead 专属填 Staff 页面或视图

### 12.3 本期仍不做

- Scope 自动生成、AI 功能、真实邮件、Tax/Cyber 主责团队、关键系统、审计领域

---

## 十三、决策记录（已冻结 · 至 v1.5）

| # | 决策 |
|---|------|
| 1 | 一项目一主责团队（ITA / Audit） |
| 2 | 新增**客户名称**，必填，创建后可改 |
| 3 | 项目列表支持**全字段模糊搜索** + **按客户/行业/年份排序** |
| 4 | Audit 项目可添加 Specialist：ITA / Tax / FRM |
| 5 | Specialist Lead 角色：IC / Manager / SM；Lead 后续填本组 Staff |
| 6 | ITA 创建项目**无** Specialist 区块 |
| 7 | 邀请统一 **Mock**，不发真实邮件 |
| 8 | Scope 初始化 MVP **维持现状**（占位） |
| 9 | 可改字段：客户名、项目名、Start/Report Date、成员；其余锁定 |
| 10 | Partner 邮箱不与 Manager/In-charge 重复 |
| 11 | Scope 未明确前看板为空 + 提示 |
| 12 | 依赖可视化后期：一套 UI + 按团队换数据 |

---

## 十四、附录

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

### B. 界面文案速查

| 场景 | 文案 |
|------|------|
| 客户名称 | Client Name / 客户名称 |
| 搜索占位 | 搜索客户、项目、行业或成员… |
| 邀请成功 | 已生成邀请链接（演示模式，未发送邮件） |
| Specialist | Specialist Teams / 专家组 |
| Scope 占位 | 项目 Scope 尚未明确 |

### C. 相关文档

- 协作教程：`docs/github-collaboration-guide.md`
- 模块认领：`docs/module-ownership-guide.md`
- GitHub：https://github.com/BenningCool/DeepSleep

---

*文档结束 · DeepSleep PRD v1.5*
