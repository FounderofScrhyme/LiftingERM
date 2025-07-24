import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// 特定の日付の現場情報を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; dateId: string } }
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

    const siteDate = await prisma.siteDate.findFirst({
      where: {
        id: params.dateId,
        site: {
          id: params.id,
          userId: user.id,
        },
      },
      include: {
        site: true,
        siteDateEmployees: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!siteDate) {
      return NextResponse.json(
        { error: "現場日が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(siteDate);
  } catch (error: any) {
    console.error("SiteDate fetch error:", error);
    return NextResponse.json(
      { error: "現場日の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 特定の日付の現場情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; dateId: string } }
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

    // 現場日が存在するかチェック
    const existingSiteDate = await prisma.siteDate.findFirst({
      where: {
        id: params.dateId,
        site: {
          id: params.id,
          userId: user.id,
        },
      },
    });

    if (!existingSiteDate) {
      return NextResponse.json(
        { error: "現場日が見つかりません" },
        { status: 404 }
      );
    }

    // 現場日データを更新
    const updatedSiteDate = await prisma.siteDate.update({
      where: { id: params.dateId },
      data: {
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
      },
    });

    // 既存のスタッフデータを削除
    await prisma.siteDateEmployee.deleteMany({
      where: { siteDateId: params.dateId },
    });

    // 新しいスタッフデータを保存
    if (body.employees && Array.isArray(body.employees)) {
      await prisma.siteDateEmployee.createMany({
        data: body.employees.map((employee: any) => ({
          siteDateId: params.dateId,
          employeeId: employee.id,
          unitPay: employee.unitPay || null,
          hourlyOvertimePay: employee.hourlyOvertimePay || null,
          userId: user.id,
        })),
      });
    }

    // 更新された現場日データを再取得
    const finalSiteDate = await prisma.siteDate.findUnique({
      where: { id: params.dateId },
      include: {
        site: true,
        siteDateEmployees: {
          include: {
            employee: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "現場日が正常に更新されました",
      siteDate: finalSiteDate,
    });
  } catch (error: any) {
    console.error("SiteDate update error:", error);
    return NextResponse.json(
      { error: "現場日の更新に失敗しました" },
      { status: 500 }
    );
  }
}
