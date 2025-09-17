# editor-yjs-example

一个基于 Vite + React + Slate + Yjs 的协同富文本编辑示例，已集成 y-websocket 服务端与多种演示页面（基础编辑、远程光标装饰、远程光标浮层）。

## 技术栈
- React 17 / TypeScript
- Vite 2
- Slate / slate-react / @slate-yjs/*
- Yjs / y-websocket
- WindiCSS

## 快速开始
1) 安装依赖
```bash
# 推荐使用 Node 16+/18+
yarn
# 或 npm i
```

2) 启动本地 y-websocket 服务端（默认 ws://localhost:1234）
```bash
yarn yws
# 或 npm run yws
```

3) 配置前端环境变量（根目录创建 .env 或 .env.local）：
```bash
VITE_Y_WEBSOCKET_ENDPOINT_URL=ws://localhost:1234
```

4) 启动前端
```bash
yarn dev
# 或 npm run dev
```
启动后浏览器会自动打开（Vite 默认行为）。

## 可用脚本
```json
{
  "dev": "vite",
  "build": "APP_ENV=production vite build",
  "serve": "vite preview",
  "yws": "node server/y-websocket-server.js"
}
```

- dev: 启动前端开发服务器
- build: 生产构建
- serve: 预览构建产物
- yws: 启动本地 y-websocket 服务端

## 主要代码位置
- 前端入口：`src/index.tsx`
- 演示页面：
  - 基础编辑：`src/pages/Simple.tsx`
  - 远程光标装饰：`src/pages/RemoteCursorDecorations.tsx`
  - 远程光标浮层：`src/pages/RemoteCursorOverlay/index.tsx`
- 协作配置：`src/config.ts`（读取 `VITE_Y_WEBSOCKET_ENDPOINT_URL`）
- y-websocket 服务端：`server/y-websocket-server.js`

## 说明与注意
- 本项目已将连接实现切换为 `y-websocket`。如需自定义房间名，请在各页面中修改 "slate-yjs-demo"。
- 若端口被占用，可通过环境变量覆盖：
  - 服务端：`PORT=1235 npm run yws`
  - 前端：`.env` 中调整 `VITE_Y_WEBSOCKET_ENDPOINT_URL`
- `tsconfig.json` 已开启严格模式并适配 Vite/React。

## 常见问题
- 前端提示无法连接：确认已运行 `npm run yws`，并检查 `VITE_Y_WEBSOCKET_ENDPOINT_URL`。
- Slate 类型错误（`value` vs `initialValue`）：请确保使用 `initialValue` 作为初始文档值，`onChange` 处理状态更新。

---
如需进一步扩展（权限、持久化、历史版本等），可考虑接入自定义持久化层或使用 yjs 的存储适配器。
