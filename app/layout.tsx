import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即梦 AI 视频生成",
  description: "部署到 Vercel 的即梦 API 视频生成网页"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
