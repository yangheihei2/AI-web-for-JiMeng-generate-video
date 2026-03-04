# 即梦 API 视频生成网页（可部署到 Vercel）

这是一个基于 Next.js 14 的网页项目，提供：
- 填写 prompt 创建视频生成任务
- 自动轮询任务状态
- 生成完成后展示视频链接

## 1. 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。

## 2. 环境变量

在 `.env.local`（本地）或 Vercel 项目环境变量中配置：

- `JIMENG_API_URL`：即梦 API 根地址
- `JIMENG_API_KEY`：即梦 API Key
- `JIMENG_MODEL`：可选，默认 `jimeng-v1`

## 3. Vercel 部署

1. 将仓库推送到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 在 Project Settings -> Environment Variables 中添加上面的 3 个变量。
4. 点击 Deploy。

## 4. API 路由

- `POST /api/generate`：创建视频任务
- `GET /api/task/:taskId`：查询任务状态

> 注意：不同版本的即梦 API 字段可能有差异，如果你的接口字段名不同，请修改 `lib/jimeng.ts` 中的请求与响应映射。
