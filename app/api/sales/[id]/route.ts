import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { salesSchema } from "@/lib/validations/sales";

// 個別売上データの取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sales = await prisma.sales.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!sales) {
      return NextResponse.json(
        { error: "売上データが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(sales);
  } catch (error: any) {
    console.error("Sales fetch error:", error);
    return NextResponse.json(
      { error: "売上データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 売上データの更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validatedData = salesSchema.parse(body);

    // 売上データが存在するかチェック
    const existingSales = await prisma.sales.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSales) {
      return NextResponse.json(
        { error: "売上データが見つかりません" },
        { status: 404 }
      );
    }

    // 取引先が存在するかチェック
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        registrarId: user.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "指定された取引先が見つかりません" },
        { status: 404 }
      );
    }

    // データベースを更新
    const updatedSales = await prisma.sales.update({
      where: { id: params.id },
      data: {
        clientId: validatedData.clientId,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        notes: validatedData.notes || null,
      },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "売上データが正常に更新されました",
      sales: updatedSales,
    });
  } catch (error: any) {
    console.error("Sales update error:", error);

    // バリデーションエラーの場合
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "売上データの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// 売上データの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 売上データが存在するかチェック
    const existingSales = await prisma.sales.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSales) {
      return NextResponse.json(
        { error: "売上データが見つかりません" },
        { status: 404 }
      );
    }

    // データベースから削除
    await prisma.sales.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "売上データが正常に削除されました",
    });
  } catch (error: any) {
    console.error("Sales deletion error:", error);
    return NextResponse.json(
      { error: "売上データの削除に失敗しました" },
      { status: 500 }
    );
  }
}
