# JiMeng Video Studio (Vercel Ready)

An English Next.js 14 UI inspired by modern AI video tools, backed by JiMeng API.

## Features

- Text-to-video and image-to-video modes
- Prompt + negative prompt
- Model, duration, aspect ratio, FPS
- Camera movement, motion strength, CFG scale, seed
- Prompt enhancement and watermark switches
- Auto polling until task completes
- Recent task list with quick links

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment Variables

- `JIMENG_API_URL`: JiMeng API base URL
- `JIMENG_API_KEY`: JiMeng API key
- `JIMENG_MODEL`: optional fallback model name

## API Routes

- `POST /api/generate` create generation task
- `GET /api/task/:taskId` query generation status

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add environment variables in Project Settings.
4. Deploy.

> JiMeng API payload fields can vary by account/version. If your provider expects different field names, update `lib/jimeng.ts` mapping.
