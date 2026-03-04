import { NextRequest, NextResponse } from "next/server";
import { createVideoTask } from "@/lib/jimeng";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      imageUrl?: string;
      durationSeconds?: 5 | 10;
      aspectRatio?: "16:9" | "9:16" | "1:1";
    };

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "prompt 不能为空" }, { status: 400 });
    }

    const result = await createVideoTask({
      prompt: body.prompt.trim(),
      imageUrl: body.imageUrl,
      durationSeconds: body.durationSeconds,
      aspectRatio: body.aspectRatio
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
