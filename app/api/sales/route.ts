import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { salesSchema } from "@/lib/validations/sales";

// 売上データの作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザーをデータベースから取得または作成
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
        },
      });
    }

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validatedData = salesSchema.parse(body);

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

    // データベースに保存
    const sales = await prisma.sales.create({
      data: {
        userId: user.id,
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

    return NextResponse.json(
      {
        message: "売上が正常に登録されました",
        sales,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sales creation error:", error);

    // バリデーションエラーの場合
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "売上の登録に失敗しました" },
      { status: 500 }
    );
  }
}

// 売上データの一覧取得
export async function GET(request: NextRequest) {
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

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const clientId = searchParams.get("clientId") || "";
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // オフセットを計算
    const offset = (page - 1) * limit;

    // 検索条件を構築
    const where: any = {
      userId: user.id,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    // 年月指定があればその月の1日〜末日で絞り込む
    if (year && month) {
      const y = parseInt(year);
      const m = parseInt(month);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999); // 月末日
      where.date = { gte: start, lte: end };
    }

    // データを取得
    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        where,
        include: {
          client: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.sales.count({ where }),
    ]);

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Sales fetch error:", error);
    return NextResponse.json(
      { error: "売上データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
