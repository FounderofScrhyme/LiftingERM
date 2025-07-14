import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

// 個別クライアントの取得
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

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        registrarId: user.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("Client fetch error:", error);
    return NextResponse.json(
      { error: "取引先の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// クライアント情報の更新
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
    const validatedData = clientSchema.parse(body);

    // クライアントが存在するかチェック
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        registrarId: user.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }

    // データベースを更新
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({
      message: "取引先が正常に更新されました",
      client: updatedClient,
    });
  } catch (error: any) {
    console.error("Client update error:", error);

    // バリデーションエラーの場合
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "取引先の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// クライアントの削除
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

    // クライアントが存在するかチェック
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        registrarId: user.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }

    // 関連する売上データがあるかチェック
    const relatedSales = await prisma.sales.findFirst({
      where: { clientId: params.id },
    });

    if (relatedSales) {
      return NextResponse.json(
        { error: "この取引先に関連する売上データがあるため削除できません" },
        { status: 400 }
      );
    }

    // データベースから削除
    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "取引先が正常に削除されました",
    });
  } catch (error: any) {
    console.error("Client deletion error:", error);
    return NextResponse.json(
      { error: "取引先の削除に失敗しました" },
      { status: 500 }
    );
  }
}
