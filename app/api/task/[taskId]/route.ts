import { NextResponse } from "next/server";
import { queryVideoTask } from "@/lib/jimeng";

type Params = {
  params: {
    taskId: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  try {
    if (!params.taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const result = await queryVideoTask(params.taskId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
