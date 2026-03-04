export type VideoMode = "text-to-video" | "image-to-video";

export type CreateVideoParams = {
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string;
  model?: string;
  mode?: VideoMode;
  durationSeconds?: 5 | 10;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  camera?: "static" | "pan" | "tilt" | "zoom";
  motionStrength?: 1 | 2 | 3 | 4 | 5;
  seed?: number;
  cfgScale?: number;
  fps?: 24 | 30;
  enhancePrompt?: boolean;
  watermark?: boolean;
};

export type TaskStatus = "pending" | "running" | "succeeded" | "failed";

const API_URL = process.env.JIMENG_API_URL;
const API_KEY = process.env.JIMENG_API_KEY;

function getHeaders() {
  if (!API_URL || !API_KEY) {
    throw new Error("Missing JIMENG_API_URL or JIMENG_API_KEY");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`
  };
}

export async function createVideoTask(params: CreateVideoParams) {
  const response = await fetch(`${API_URL}/videos/generations`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: params.model ?? process.env.JIMENG_MODEL ?? "jimeng-v1",
      mode: params.mode ?? "text-to-video",
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      image_url: params.imageUrl,
      duration_seconds: params.durationSeconds ?? 5,
      aspect_ratio: params.aspectRatio ?? "16:9",
      camera: params.camera ?? "static",
      motion_strength: params.motionStrength ?? 3,
      seed: params.seed,
      cfg_scale: params.cfgScale ?? 7,
      fps: params.fps ?? 24,
      enhance_prompt: params.enhancePrompt ?? true,
      watermark: params.watermark ?? false
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Create task failed: ${response.status} ${errText}`);
  }

  return response.json() as Promise<{ task_id: string }>;
}

export async function queryVideoTask(taskId: string) {
  const response = await fetch(`${API_URL}/videos/generations/${taskId}`, {
    method: "GET",
    headers: getHeaders()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Query task failed: ${response.status} ${errText}`);
  }

  return response.json() as Promise<{
    task_id: string;
    status: TaskStatus;
    progress?: number;
    video_url?: string;
    cover_url?: string;
    error_message?: string;
  }>;
}
