import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

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
      // ユーザーが存在しない場合は作成
      user = await prisma.user.create({
        data: {
          clerkId: userId,
        },
      });
    }

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validatedData = clientSchema.parse(body);

    // データベースに保存
    const client = await prisma.client.create({
      data: {
        registrarId: user.id,
        companyName: validatedData.company_name,
        phone: validatedData.phone || "",
        address: validatedData.address || "",
        postalCode: validatedData.postal_code || "",
        contactPerson: validatedData.contact_person || "",
        contactPhone: validatedData.contact_phone || "",
        contactEmail: validatedData.contact_email || null,
        notes: validatedData.notes || null,
      },
    });

    return NextResponse.json(
      {
        message: "取引先が正常に登録されました",
        client,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Client creation error:", error);

    // バリデーションエラーの場合
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "取引先の登録に失敗しました" },
      { status: 500 }
    );
  }
}

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
    const search = searchParams.get("search") || "";

    // オフセットを計算
    const offset = (page - 1) * limit;

    // 検索条件を構築
    const where = {
      registrarId: user.id,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" as const } },
          { contactPerson: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // データを取得
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Client fetch error:", error);
    return NextResponse.json(
      { error: "取引先の取得に失敗しました" },
      { status: 500 }
    );
  }
}
