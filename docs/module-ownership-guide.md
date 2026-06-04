# DeepSleep 三大功能模块认领与开发指南

这份文档给认领功能模块的队友使用。目标是让大家并行开发时少冲突、好合并、能稳定演示。

## 1. 当前项目结构

```text
src/
  components/
    Sidebar.jsx
    Topbar.jsx
    BoardHeader.jsx
    Board.jsx
    TaskCard.jsx
    TaskDrawer.jsx
  data/
    mockData.js
  modules/
    scope-init/
    workspace/
    progress-board/
  utils/
    taskUtils.js
  main.jsx
  styles.css
```

## 2. 三个模块如何认领

| 模块 | 适合认领人 | 分支名 | 主要目录 |
| --- | --- | --- | --- |
| 审计定制化 / Scope 初始化 | 队友 A | `feature/scope-init` | `src/modules/scope-init/` |
| 协同办公 / 个人工作台 | 队友 B | `feature/workspace` | `src/modules/workspace/` |
| 进度看板 / 依赖可视化 | 队友 C | `feature/progress-board` | `src/modules/progress-board/` |

每个人优先在自己的模块目录里写代码。确实需要改公共组件时，先在群里说一下，避免两个人同时改同一个文件。

## 3. 模块 A：审计定制化 / Scope 初始化

认领目录：

```text
src/modules/scope-init/
```

建议开发内容：

- `ScopeInitPanel.jsx`：Scope 初始化页面或面板
- `scopeTemplates.js`：行业、审计领域、项目类型对应的模板
- `scopeRules.js`：关键步骤不可跳过规则
- 创建项目时，根据选择自动生成初始任务

建议第一版做到：

- 有行业选择
- 有审计领域选择
- 有项目类型选择
- 点击“生成 Scope”后能看到初始化任务清单

## 4. 模块 B：协同办公 / 个人工作台

认领目录：

```text
src/modules/workspace/
```

建议开发内容：

- `WorkspacePage.jsx`：个人工作台主页面
- `MemberLoadPanel.jsx`：成员负荷统计
- `memberData.js`：成员 mock 数据
- 我的任务、我的项目、P0 数量、逾期数量统计

建议第一版做到：

- 能按负责人展示任务
- 能看到每个成员负责多少任务
- 能看到 P0 和逾期任务数量

## 5. 模块 C：进度看板 / 依赖可视化

认领目录：

```text
src/modules/progress-board/
```

建议开发内容：

- `ProgressBoard.jsx`：增强版进度看板
- `DependencyMap.jsx`：ITGC / ITAC 依赖关系图
- `dependencyData.js`：依赖关系 mock 数据
- 阻塞状态、前后置任务、阶段进度统计

建议第一版做到：

- 能展示 ITGC / ITAC 的关系
- 能展示任务之间的前后置依赖
- 能标记阻塞任务

## 6. 公共文件怎么改

公共组件在：

```text
src/components/
```

公共数据在：

```text
src/data/mockData.js
```

工具函数在：

```text
src/utils/taskUtils.js
```

样式在：

```text
src/styles.css
```

如果你要改这些公共文件，请先做两件事：

1. 在群里说自己要改哪个文件
2. 拉最新 main 后再开始改

```bash
git checkout main
git pull
git checkout feature/你的分支名
git merge main
```

## 7. 认领模块后的标准操作

第一次开始：

```bash
git clone https://github.com/BenningCool/DeepSleep.git
cd DeepSleep
npm install
git checkout -b feature/你的模块名
npm run dev
```

每天开始：

```bash
git checkout main
git pull
git checkout feature/你的模块名
git merge main
npm run dev
```

提交前：

```bash
npm run build
git status
git add .
git commit -m "feat: add your module"
git push origin feature/你的模块名
```

然后去 GitHub 上创建 Pull Request。

## 8. Pull Request 说明模板

```md
## 做了什么
- 

## 属于哪个模块
- [ ] Scope 初始化
- [ ] 协同办公 / 个人工作台
- [ ] 进度看板 / 依赖可视化

## 怎么测试
- [ ] npm run build
- [ ] npm run dev 后浏览器检查

## 需要队友重点看
- 
```

## 9. 冲突时怎么办

如果 Git 提示 conflict，不要直接删除别人的代码。先看冲突文件里的标记：

```text
<<<<<<< HEAD
你的分支代码
=======
main 或队友的代码
>>>>>>> main
```

处理原则：

- 保留双方都需要的逻辑
- 删除 `<<<<<<<`、`=======`、`>>>>>>>` 这些标记
- 跑一次 `npm run build`
- 再提交冲突修复

```bash
git add .
git commit -m "fix: resolve merge conflict"
```

## 10. 最重要的三句话

- 不要直接在 `main` 写代码。
- 每个人优先改自己模块目录。
- 合并前一定跑 `npm run build`。
