"use client";

import { FormEvent, useMemo, useState } from "react";

type GenerateResp = { task_id: string; error?: string };
type TaskResp = {
  task_id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  progress?: number;
  video_url?: string;
  cover_url?: string;
  error_message?: string;
  error?: string;
};

type GenerationRecord = {
  taskId: string;
  prompt: string;
  status: string;
  videoUrl?: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mode, setMode] = useState<"text-to-video" | "image-to-video">("text-to-video");
  const [imageUrl, setImageUrl] = useState("");
  const [model, setModel] = useState("jimeng-v1");
  const [durationSeconds, setDurationSeconds] = useState<5 | 10>(5);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [camera, setCamera] = useState<"static" | "pan" | "tilt" | "zoom">("static");
  const [motionStrength, setMotionStrength] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [cfgScale, setCfgScale] = useState(7);
  const [fps, setFps] = useState<24 | 30>(24);
  const [seed, setSeed] = useState<string>("");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("Ready");
  const [videoUrl, setVideoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GenerationRecord[]>([]);

  const canSubmit = useMemo(() => {
    const hasPrompt = prompt.trim().length > 0;
    const hasImage = mode === "text-to-video" || imageUrl.trim().length > 0;
    return hasPrompt && hasImage && !loading;
  }, [prompt, imageUrl, mode, loading]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("Creating task...");
    setVideoUrl("");
    setCoverUrl("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          mode,
          imageUrl: mode === "image-to-video" ? imageUrl : undefined,
          model,
          durationSeconds,
          aspectRatio,
          camera,
          motionStrength,
          cfgScale,
          fps,
          seed: seed ? Number(seed) : undefined,
          enhancePrompt,
          watermark
        })
      });

      const data = (await res.json()) as GenerateResp;
      if (!res.ok || !data.task_id) {
        throw new Error(data.error ?? "Create task failed");
      }

      setTaskId(data.task_id);
      setStatus(`Task created: ${data.task_id}. Polling status...`);
      setHistory((prev) => [{ taskId: data.task_id, prompt, status: "pending" }, ...prev].slice(0, 8));
      await pollTask(data.task_id, prompt);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function pollTask(currentTaskId: string, currentPrompt: string) {
    for (let i = 0; i < 80; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const res = await fetch(`/api/task/${currentTaskId}`);
      const data = (await res.json()) as TaskResp;

      if (!res.ok) {
        throw new Error(data.error ?? "Polling failed");
      }

      if (data.status === "succeeded" && data.video_url) {
        setStatus("Done. Your video is ready.");
        setVideoUrl(data.video_url);
        setCoverUrl(data.cover_url ?? "");
        setHistory((prev) =>
          prev.map((item) =>
            item.taskId === currentTaskId
              ? { ...item, status: "succeeded", videoUrl: data.video_url }
              : item
          )
        );
        return;
      }

      if (data.status === "failed") {
        setHistory((prev) =>
          prev.map((item) => (item.taskId === currentTaskId ? { ...item, status: "failed" } : item))
        );
        throw new Error(data.error_message ?? "Video generation failed");
      }

      setHistory((prev) =>
        prev.map((item) => (item.taskId === currentTaskId ? { ...item, status: data.status } : item))
      );
      const progress = data.progress ? `${data.progress}%` : "processing";
      setStatus(`Task status: ${data.status} (${progress})`);
    }

    throw new Error("Polling timed out. You can retry with task id.");
  }

  return (
    <main className="appShell">
      <header className="topBar">
        <h1>JiMeng Video Studio</h1>
        <p>Professional-style interface for text/image-to-video generation.</p>
      </header>

      <div className="layout">
        <form onSubmit={onSubmit} className="panel">
          <h2>Create</h2>
          <label>
            Prompt
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a neon city at night, volumetric lighting"
              rows={4}
            />
          </label>

          <label>
            Negative Prompt
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="low quality, blur, artifacts, deformed"
              rows={2}
            />
          </label>

          <div className="row2">
            <label>
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value as "text-to-video" | "image-to-video") }>
                <option value="text-to-video">Text to Video</option>
                <option value="image-to-video">Image to Video</option>
              </select>
            </label>

            <label>
              Model
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="jimeng-v1">jimeng-v1</option>
                <option value="jimeng-v2">jimeng-v2</option>
              </select>
            </label>
          </div>

          {mode === "image-to-video" && (
            <label>
              Source Image URL
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/first-frame.png"
              />
            </label>
          )}

          <div className="row3">
            <label>
              Duration
              <select
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value) as 5 | 10)}
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
              </select>
            </label>
            <label>
              Aspect
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as "16:9" | "9:16" | "1:1")}
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </select>
            </label>
            <label>
              FPS
              <select value={fps} onChange={(e) => setFps(Number(e.target.value) as 24 | 30)}>
                <option value={24}>24</option>
                <option value={30}>30</option>
              </select>
            </label>
          </div>

          <div className="row3">
            <label>
              Camera
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value as "static" | "pan" | "tilt" | "zoom")}
              >
                <option value="static">Static</option>
                <option value="pan">Pan</option>
                <option value="tilt">Tilt</option>
                <option value="zoom">Zoom</option>
              </select>
            </label>
            <label>
              Motion Strength (1-5)
              <input
                type="number"
                min={1}
                max={5}
                value={motionStrength}
                onChange={(e) => setMotionStrength(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              />
            </label>
            <label>
              CFG Scale
              <input
                type="number"
                min={1}
                max={20}
                step={0.5}
                value={cfgScale}
                onChange={(e) => setCfgScale(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="row2">
            <label>
              Seed (optional)
              <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="42" />
            </label>
            <div className="toggleGroup">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={enhancePrompt}
                  onChange={(e) => setEnhancePrompt(e.target.checked)}
                />
                Prompt Enhance
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                />
                Watermark
              </label>
            </div>
          </div>

          <button type="submit" disabled={!canSubmit}>
            {loading ? "Generating..." : "Generate Video"}
          </button>
        </form>

        <section className="panel">
          <h2>Output</h2>
          <p className="status">{status}</p>
          {taskId && <p className="mono">Task ID: {taskId}</p>}
          {coverUrl && <img src={coverUrl} alt="video cover" className="cover" />}
          {videoUrl && (
            <a href={videoUrl} target="_blank" rel="noreferrer" className="cta">
              Open Generated Video
            </a>
          )}

          <h3>Recent Tasks</h3>
          <ul className="history">
            {history.length === 0 && <li>No tasks yet.</li>}
            {history.map((item) => (
              <li key={item.taskId}>
                <span>{item.prompt.slice(0, 45)}</span>
                <strong>{item.status}</strong>
                <small>{item.taskId}</small>
                {item.videoUrl && (
                  <a href={item.videoUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
