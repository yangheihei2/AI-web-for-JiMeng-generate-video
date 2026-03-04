"use client";

import { FormEvent, useMemo, useState } from "react";

type GenerateResp = { task_id: string; error?: string };
type TaskResp = {
  task_id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  video_url?: string;
  error_message?: string;
  error?: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<5 | 10>(5);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("正在创建任务...");
    setVideoUrl("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrl: imageUrl || undefined,
          durationSeconds,
          aspectRatio
        })
      });

      const data = (await res.json()) as GenerateResp;
      if (!res.ok || !data.task_id) {
        throw new Error(data.error ?? "创建任务失败");
      }

      setTaskId(data.task_id);
      setStatus(`任务已创建：${data.task_id}，正在轮询...`);
      await pollTask(data.task_id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function pollTask(currentTaskId: string) {
    for (let i = 0; i < 60; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const res = await fetch(`/api/task/${currentTaskId}`);
      const data = (await res.json()) as TaskResp;

      if (!res.ok) {
        throw new Error(data.error ?? "轮询失败");
      }

      if (data.status === "succeeded" && data.video_url) {
        setStatus("视频生成完成！");
        setVideoUrl(data.video_url);
        return;
      }

      if (data.status === "failed") {
        throw new Error(data.error_message ?? "视频生成失败");
      }

      setStatus(`当前状态：${data.status}（${i + 1}/60）`);
    }

    throw new Error("轮询超时，请稍后手动查询 taskId");
  }

  return (
    <main className="container">
      <h1>即梦 AI 视频生成</h1>
      <p className="desc">输入提示词，点击生成，页面会自动轮询直到拿到视频链接。</p>

      <form onSubmit={onSubmit} className="card">
        <label>
          提示词（必填）
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：赛博朋克夜景，一只机械猫在雨中奔跑，电影镜头"
            rows={4}
          />
        </label>

        <label>
          首帧图 URL（可选）
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
        </label>

        <div className="grid">
          <label>
            时长
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value) as 5 | 10)}
            >
              <option value={5}>5 秒</option>
              <option value={10}>10 秒</option>
            </select>
          </label>

          <label>
            比例
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as "16:9" | "9:16" | "1:1")}
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={!canSubmit}>
          {loading ? "生成中..." : "生成视频"}
        </button>
      </form>

      <section className="card">
        <h2>任务状态</h2>
        <p>{status || "尚未开始"}</p>
        {taskId && <p>task_id: {taskId}</p>}
        {videoUrl && (
          <p>
            视频地址：
            <a href={videoUrl} target="_blank" rel="noreferrer">
              点击打开
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
