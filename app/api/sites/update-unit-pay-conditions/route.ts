import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザーをデータベースから取得
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // unitPayConditionが空の現場を更新
    const updatedSites = await prisma.site.updateMany({
      where: {
        userId: user.id,
        unitPayCondition: "",
      },
      data: {
        unitPayCondition: "normal",
      },
    });

    return NextResponse.json({
      message: `${updatedSites.count}件の現場を更新しました`,
      updatedCount: updatedSites.count,
    });
  } catch (error) {
    console.error("現場更新エラー:", error);
    return NextResponse.json(
      { error: "現場の更新に失敗しました" },
      { status: 500 }
    );
  }
}
