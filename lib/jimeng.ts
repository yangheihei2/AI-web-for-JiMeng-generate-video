export type CreateVideoParams = {
  prompt: string;
  imageUrl?: string;
  durationSeconds?: 5 | 10;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};

export type TaskStatus = "pending" | "running" | "succeeded" | "failed";

const API_URL = process.env.JIMENG_API_URL;
const API_KEY = process.env.JIMENG_API_KEY;

function getHeaders() {
  if (!API_URL || !API_KEY) {
    throw new Error("JIMENG_API_URL 或 JIMENG_API_KEY 未配置");
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
      model: process.env.JIMENG_MODEL ?? "jimeng-v1",
      prompt: params.prompt,
      image_url: params.imageUrl,
      duration_seconds: params.durationSeconds ?? 5,
      aspect_ratio: params.aspectRatio ?? "16:9"
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`创建任务失败: ${response.status} ${errText}`);
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
    throw new Error(`查询任务失败: ${response.status} ${errText}`);
  }

  return response.json() as Promise<{
    task_id: string;
    status: TaskStatus;
    video_url?: string;
    error_message?: string;
  }>;
}
