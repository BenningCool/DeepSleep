# DeepSleep 项目看板

一个用于黑客松演示和团队协作开发的 JIRA 风格项目管理看板。

## 功能

- 看板列：待办、需求梳理、设计中、开发中、测试/复核、已完成
- 任务卡片：标题、描述、优先级、端、产品线、负责人、截止日期、批注
- 交互：新建、编辑、删除、拖拽移动、搜索、筛选、一键重置样例
- 存储：浏览器 `localStorage`，刷新后保留当前任务数据

## 技术栈

- Vite
- React
- CSS

## 本地开发

```bash
npm install
npm run dev
```

构建静态产物：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 协作建议

- 页面入口：`src/main.jsx`
- 样例数据和看板列：`src/mockData.js`
- 全局样式：`src/styles.css`
- 后续如果功能变多，可以把 `src/main.jsx` 中的组件继续拆到 `src/components/`
- 小白协作教程：[docs/github-collaboration-guide.md](docs/github-collaboration-guide.md)
