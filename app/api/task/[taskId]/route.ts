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
      return NextResponse.json({ error: "taskId 不能为空" }, { status: 400 });
    }

    const result = await queryVideoTask(params.taskId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
