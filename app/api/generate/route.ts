import { NextRequest, NextResponse } from "next/server";
import { createVideoTask } from "@/lib/jimeng";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      negativePrompt?: string;
      imageUrl?: string;
      model?: string;
      mode?: "text-to-video" | "image-to-video";
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

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    if (body.mode === "image-to-video" && !body.imageUrl?.trim()) {
      return NextResponse.json({ error: "imageUrl is required for image-to-video" }, { status: 400 });
    }

    const result = await createVideoTask({
      prompt: body.prompt.trim(),
      negativePrompt: body.negativePrompt?.trim(),
      imageUrl: body.imageUrl?.trim(),
      model: body.model,
      mode: body.mode,
      durationSeconds: body.durationSeconds,
      aspectRatio: body.aspectRatio,
      camera: body.camera,
      motionStrength: body.motionStrength,
      seed: body.seed,
      cfgScale: body.cfgScale,
      fps: body.fps,
      enhancePrompt: body.enhancePrompt,
      watermark: body.watermark
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
