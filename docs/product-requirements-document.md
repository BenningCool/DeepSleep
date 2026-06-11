# DeepSleep 产品需求文档（PRD）

> **文档用途**：黑客松 DeepSleep 项目的产品需求定稿。  
> **同步说明**：请将本文档内容复制至飞书 Wiki：[产品需求文档](https://my.feishu.cn/wiki/GDGcwzpuciqBpjkgoCdcLYO2n3c)  
> **当前版本**：v1.3 · 2026-06-04

---

## 一、版本信息

| 项目 | 内容 |
|------|------|
| 版本号 | v1.3 |
| 创建日期 | 2026-06-04 |
| 审核人 | 待定 |
| 状态 | 黑客松 MVP 需求冻结稿 |

---

## 二、变更日志

| 时间 | 版本 | 变更人 | 主要变更内容 |
|------|------|--------|-------------|
| 2026-06-04 | v1.0 | 团队 | 初版：三大模块分工、Scope 初始化方向 |
| 2026-06-04 | v1.1 | 团队 | 明确两步流：基本信息 → Scope 初始化 |
| 2026-06-04 | v1.2 | 团队 | **收窄 MVP**：暂不做 Scope 自动生成；新增 New Engagement / Recurring |
| 2026-06-04 | v1.3 | 团队 | 创建成功进入**项目详情页**；行业清单定稿；看板 Scope 未明确前为空 + 提示；去掉关键系统、审计领域、Tax/Cyber |

---

## 三、文档说明

### 3.1 名词解释

| 术语 / 缩略词 | 说明 |
|--------------|------|
| **DeepSleep** | 面向审计团队的项目管理与协作看板（黑客松原型） |
| **ITA** | IT Audit，IT 审计团队 |
| **Audit** | 财务报表审计团队（IT 相关部分） |
| **ITGC** | IT General Controls，IT 一般控制 |
| **ITAC** | IT Application Controls，IT 应用控制 |
| **Scope** | 审计范围，包括项目边界、关键系统、控制点与任务清单 |
| **New Engagement** | 新项目 / 首年项目 / 新客户业务 |
| **Recurring** | 续聘项目 / 滚动项目 / 可沿用上年底稿 |
| **Partner** | 合伙人 |
| **Manager** | 经理 |
| **In-charge（IC）** | 项目负责人 |
| **Senior Manager（SM）** | 高级经理 |
| **Staff** | 项目组成员 |
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
| 多项目视图弱 | 切换项目、看整体进度累，缺少全局视角 |
| 配置复杂 | 自定义字段、工作流、权限方案学习成本高 |
| 移动端体验差 | 现场审计移动场景支持不足 |
| 高级功能付费 | 部分能力需额外采购 |

### 4.3 竞品：JIRA 可借鉴 vs. 我方策略

| 维度 | JIRA 优势 | DeepSleep 策略 |
|------|----------|----------------|
| 工作流 | 复杂状态流转、转换条件 | **保留**：审计阶段预设路径，关键步骤不可跳过 |
| 合规 | 流转条件、审批 | **保留**：阶段门禁；后期可加审批 |
| 仪表盘 | 个人待办、到期、阻塞 | **保留**：个人工作台（模块 B） |
| 角色 | 成熟权限模型 | **收窄 MVP**：四级角色 + 邮箱邀请；权限 mock |
| 审计日志 | 完整变更记录 | **保留方向**：操作留痕（后期） |
| 依赖可视化 | 阻塞与依赖图 | **增强**：ITGC/ITAC 依赖（模块 C，一套 UI） |
| 项目初始化 | 需手工建任务 | **重建**：按团队 + 项目类型 + 行业自动生成 Scope（**后期**） |
| 查询 | JQL | **增强方向**：自然语言筛选（后期） |

### 4.4 产品设计策略（黑客松 MVP）

**保留**

1. 审计阶段预设流转路径，不允许跳过关键步骤（Scope 明确后生效）
2. 个人工作台：「我负责的、今天到期的、被阻塞的」
3. 项目角色：Partner、Manager、In-charge、Senior Manager、Staff
4. 操作留痕方向：时间戳 + 操作人（后期）

**收窄（MVP）**

1. 不做复杂管理员配置
2. 不做真实邮件与完整账号体系（邀请 mock）
3. 仅支持 **ITA、Audit** 两个团队（Tax、Cyber 后期）
4. **本期不做 Scope 自动生成**，仅录入基本信息 + 项目详情页

**增强（后期）**

1. ITGC / ITAC 依赖关系可视化（一套 UI，按团队切换数据）
2. 自然语言替代 JQL
3. 创建项目时 AI / 规则自动完成约 80% Scope 初始化

---

## 五、产品定位

| 项目 | 说明 |
|------|------|
| 产品名 | DeepSleep 项目看板 |
| 目标用户 | 四大 **ITA**、**Audit** 团队审计师 |
| 核心价值 | 审计友好的项目创建、成员协作、进度与 Scope 管理 |
| 黑客松形态 | Vite + React 前端原型，数据存浏览器 `localStorage` |
| 仓库 | https://github.com/BenningCool/DeepSleep |

---

## 六、功能架构

```text
DeepSleep
├── 项目创建（本期 MVP）
│   ├── 基本信息表单
│   ├── 成员邮箱与邀请（mock）
│   └── 创建成功 → 项目详情页
├── 项目详情页（本期 MVP）
│   ├── 基本信息展示
│   ├── 成员管理
│   ├── Scope 区（占位，待明确）
│   └── 看板入口（Scope 未明确前：空看板 + 提示）
├── 模块 A：Scope 初始化（后期）
├── 模块 B：协同办公 / 个人工作台（后期）
└── 模块 C：进度看板 / 依赖可视化（后期）
```

### 6.1 模块分工（开发分支）

| 模块 | 分支 | 负责人 | MVP 状态 |
|------|------|--------|----------|
| 项目创建 + 详情页 | `feature/scope-init` | 队友 A | **本期** |
| 协同办公 / 个人工作台 | `feature/workspace` | 队友 B | 后期 |
| 进度看板 / 依赖可视化 | `feature/progress-board` | 队友 C | 后期 |

---

## 七、功能需求 · 项目创建（本期 MVP）

### 7.1 流程

```text
填写基本信息 → 确认创建项目 → Mock 成员邀请 → 进入项目详情页
```

- **本期无** Scope 初始化步骤
- **本期无** 关键系统、审计领域字段

### 7.2 基本信息字段

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| 团队 | ✅ | 单选 | `ITA` \| `Audit`（MVP 仅两项） |
| 项目性质 | ✅ | 单选 | `New Engagement` \| `Recurring`（**界面英文**） |
| 项目类型 | ✅ | 单选 | 见 7.3，与团队**无限制** |
| 行业 | ✅ | 单选 | 见 7.4，中英混合文案 |
| 项目名称 | ✅ | 文本 | 最长建议 60 字 |
| 计划开始日期 | ✅ | 日期 | — |

**项目规则**

- **一个项目 = 一个主责团队**（不跨团队协作）
- 团队与项目类型任意组合，不做限制

### 7.3 项目类型（5 类）

1. 年度财务报表审计
2. 专项 IT 审计
3. IPO 核查
4. SOC 1 / SOC 2 审计
5. 个人信息保护合规审计

### 7.4 行业清单（MVP）

> 粒度：不做半导体、生物科技等过细分类。  
> 文案：**中英混合**（符合四大风格）。

#### 金融 Financial Services

| 值 | 显示名称 |
|----|----------|
| finance-banking | 金融 — Banking / 银行 |
| finance-insurance | 金融 — Insurance / 保险 |
| finance-securities | 金融 — Securities & Asset Mgmt / 证券资管 |
| finance-other | 金融 — Other / 其他 |

#### 制造业 Manufacturing

| 值 | 显示名称 |
|----|----------|
| mfg-general | 制造业 — General / 通用 |
| mfg-automotive | 制造业 — Automotive / 汽车 |
| mfg-chemicals | 制造业 — Chemicals / 化工 |
| mfg-industrial | 制造业 — Industrial / 工业装备 |

#### 零售与消费 Retail & Consumer

| 值 | 显示名称 |
|----|----------|
| retail-general | 零售 — General / 通用 |
| retail-fmcg | 零售 — FMCG / 快消 |
| retail-ecommerce | 零售 — E-commerce / 电商 |

#### TMT

| 值 | 显示名称 |
|----|----------|
| tmt-technology | TMT — Technology / 科技互联网 |
| tmt-media | TMT — Media / 传媒 |
| tmt-telecom | TMT — Telecom / 电信 |

#### 其他行业

| 值 | 显示名称 |
|----|----------|
| healthcare-pharma | 医药健康 — Pharma / 制药 |
| healthcare-devices | 医药健康 — MedTech / 医疗器械 |
| healthcare-services | 医药健康 — Healthcare Services / 医疗服务 |
| energy-oil-gas | 能源 — Oil & Gas / 石油天然气 |
| energy-power | 能源 — Power & Utilities / 电力公用 |
| real-estate | 房地产 — Real Estate |
| construction | 建筑 — Construction & Engineering |
| transport-logistics | 交通运输 — Transport & Logistics |
| hospitality-leisure | 酒店餐饮 — Hospitality & Leisure |
| education | 教育 — Education |
| agriculture | 农业 — Agriculture |
| mining | 采矿 — Mining |
| government-public | 政府公共 — Government & Public Sector |
| private-equity | 私募股权 — Private Equity |
| other | 其他 — Other |

### 7.5 项目成员（邮箱）

| 角色 | 必填 | 填写内容 | 说明 |
|------|------|----------|------|
| Partner | ✅ | 邮箱 | 独立角色，**不得**与 Manager / In-charge 重复 |
| Manager | ✅ | 邮箱 | 可与 In-charge 相同 |
| In-charge | ✅ | 邮箱 | **项目负责人**；可与 Staff 相同 |
| Senior Manager | ❌ | 邮箱 | 选填 |
| Staff | ❌ | 多个邮箱 | **无人数上限**；可与 In-charge 相同 |

**邮箱校验**

- 合法邮箱格式
- Partner 邮箱全局唯一（相对 Manager、In-charge）
- Staff 列表内不建议重复同一邮箱

### 7.6 邀请机制（Mock）

| 项目 | 说明 |
|------|------|
| 真实邮件 | **本期不做** |
| 行为 | 创建成功后为每个成员生成邀请链接，界面展示可复制 |
| 模板 | **固定模板，中英双语**（项目名、团队、角色、链接） |
| 创建后 | 可新增 / 修改 / 删除成员；**删除即失去项目权限** |
| 必填角色 | Partner、Manager、In-charge 始终各至少 1 人 |

**邀请邮件模板（示例）**

```text
【中文】
您已被邀请加入审计项目「{项目名称}」。
团队：{ITA/Audit} · 角色：{Partner/Manager/...}
请点击链接加入项目：{url}

【English】
You have been invited to join the engagement "{Project Name}".
Team: {ITA/Audit} · Role: {Partner/Manager/...}
Please click the link below to join: {url}
```

---

## 八、功能需求 · 项目详情页（本期 MVP）

### 8.1 定位

- 创建项目成功后的**默认落地页**
- 汇总展示已确认的基本信息
- 为后续**协同办公 / 个人工作台**提供项目锚点
- 为后续 **Scope 明确**预留区域

### 8.2 页面结构

| 区块 | 内容 |
|------|------|
| **概览** | 项目名称、团队、New Engagement / Recurring、项目类型、行业、开始日期 |
| **成员** | 各角色邮箱、邀请状态（已发送 mock）、可复制链接 |
| **Scope** | 占位：「项目 Scope 尚未明确，后续将在此初始化审计范围与任务清单」 |
| **快捷入口** | 看板、工作台（可灰显）、依赖图（可灰显） |

### 8.3 看板入口（方案 A）

- Scope **未明确前**：可进入看板，展示**空看板 + 提示文案**
- 提示示例：「请先在项目详情中明确 Scope，再开始任务管理」
- Scope 明确后（后期）：导入任务，看板正常展示

### 8.4 成员管理

| 操作 | 行为 |
|------|------|
| 编辑基本信息 | 修改团队、项目性质、类型、行业等 |
| 新增成员 | 补录邮箱 → 生成新 mock 邀请 |
| 修改成员 | 更新邮箱 → 旧 token 失效（建议）→ 新邀请 |
| 删除成员 | 移除 → 权限 revoke |

---

## 九、功能需求 · Scope 初始化（后期，本期不做）

> 本期仅在详情页保留 Scope 占位区。下列需求供下一阶段开发。

### 9.1 触发时机

用户在项目详情页点击「初始化 Scope」后进入。

### 9.2 输入维度

```text
团队 × 项目类型 × 行业 × 开始日期
（无关键系统、无审计领域）
```

### 9.3 输出

- 自动生成约 **80%** 初始化任务清单
- 按审计阶段分组预览
- 确认后导入看板
- 关键步骤阶段门禁：不可跨列跳转；前置关键任务未完成则不可推进

### 9.4 任务默认规则

- Owner 默认 **In-charge**
- 任务 `product` = 项目名称
- 标记 `scopeGenerated`、`scopeCritical`（关键步骤）

---

## 十、功能需求 · 协同办公 / 个人工作台（后期）

| 能力 | 说明 |
|------|------|
| 我的任务 | 按负责人聚合 |
| 我的项目 | 按成员邮箱关联 |
| 工作负荷 | 任务数、P0 数、逾期数（mock 统计） |
| 与详情页关系 | 以项目 ID 为锚点；Scope 明确后展示任务负荷 |

**分支**：`feature/workspace` · 目录 `src/modules/workspace/`

---

## 十一、功能需求 · 进度看板 / 依赖可视化（后期）

| 能力 | 说明 |
|------|------|
| 看板增强 | 在通用 Kanban 上增强筛选与阶段统计 |
| 依赖可视化 | **一套 UI 组件**，按项目 `team` 加载不同 mock 数据 |
| ITA 数据 | 偏系统 / 控制域依赖 |
| Audit 数据 | 偏业务流程 / 认定依赖 |

**不做**：每个团队独立一套页面。

**分支**：`feature/progress-board` · 目录 `src/modules/progress-board/`

---

## 十二、看板列（全局共用）

| 列 ID | 显示名称 |
|-------|----------|
| todo | 待办 |
| grooming | 需求梳理 |
| design | 设计中 |
| development | 开发中 |
| review | 测试/复核 |
| done | 已完成 |

ITA、Audit 共用同一套列名（黑客松 MVP）。

---

## 十三、非功能需求

| 项目 | 要求 |
|------|------|
| 技术栈 | Vite + React + CSS |
| 数据持久化 | 浏览器 `localStorage`（演示级） |
| 构建 | `npm run build` 须通过 |
| 协作 | 功能分支 + Pull Request，不直接改 `main` |
| 语言 | 界面中英混合（行业、角色、项目性质等） |

---

## 十四、MVP 范围总览

### 14.1 本期交付

- [ ] 项目创建表单（团队、New Engagement/Recurring、项目类型、行业、成员邮箱）
- [ ] 校验规则（必填、Partner 邮箱独立、邮箱格式）
- [ ] 确认创建 → 保存项目 → mock 邀请列表
- [ ] 项目详情页（概览 + 成员 + Scope 占位）
- [ ] 看板：Scope 未明确时空状态 + 提示
- [ ] 成员增删改 + 删除 revoke

### 14.2 本期不做

- [ ] Scope 自动生成与导入
- [ ] 关键系统、审计领域
- [ ] Tax、Cyber 团队
- [ ] 真实邮件服务
- [ ] 完整登录与权限系统
- [ ] 跨团队协作
- [ ] 依赖可视化（模块 C 完整版）
- [ ] 个人工作台完整版（模块 B）

---

## 十五、数据模型（概念）

```text
Project
├── id
├── name
├── team                    # ITA | Audit
├── engagementType          # new | recurring
├── projectType             # 5 类枚举
├── industry                # 行业 ID
├── startDate
├── members[]
│   ├── email
│   ├── role                # partner | manager | in_charge | sm | staff
│   ├── inviteToken
│   ├── status              # active | revoked
│   └── invitedAt
├── scopeStatus             # pending | defined（本期恒为 pending）
└── tasks[]                 # Scope 明确后才有（本期为空）
```

---

## 十六、决策记录（已冻结）

| # | 决策 |
|---|------|
| 1 | 一项目一团队（ITA / Audit） |
| 2 | 团队与项目类型无限制 |
| 3 | 项目性质 UI 英文：New Engagement / Recurring |
| 4 | 行业 ~24 项，中英混合，MVP 不过细 |
| 5 | 成员邮箱制；Partner 不与 Manager/In-charge 重复 |
| 6 | Manager↔In-charge、In-charge↔Staff 可重复 |
| 7 | Staff 无上限；邀请 mock，中英模板 |
| 8 | 创建成功 → 项目详情页（非直接空看板） |
| 9 | Scope 未明确前看板为空 + 提示（方案 A） |
| 10 | Scope 初始化、关键系统、审计领域 — 本期不做 |
| 11 | 依赖可视化后期：一套 UI + 按团队换数据 |
| 12 | Tax、Cyber — 本期不做 |

---

## 十七、附录

### A. 相关文档

- 协作教程：`docs/github-collaboration-guide.md`
- 模块认领：`docs/module-ownership-guide.md`
- GitHub：https://github.com/BenningCool/DeepSleep

### B. 界面文案速查

| 场景 | 文案 |
|------|------|
| 创建按钮 | 确认创建项目 |
| 项目性质 | New Engagement / Recurring |
| Scope 占位 | 项目 Scope 尚未明确。后续将在此初始化审计范围与任务清单。 |
| 空看板提示 | 请先在项目详情中明确 Scope，再开始任务管理。 |
| 邀请成功 | 已生成邀请链接（演示模式，未发送真实邮件） |

---

*文档结束 · DeepSleep PRD v1.3*
