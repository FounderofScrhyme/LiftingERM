import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { siteSchema } from "@/lib/validations/site";

// 個別現場データの取得
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

    const site = await prisma.site.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        siteDates: {
          orderBy: { date: "asc" },
          include: {
            siteDateEmployees: {
              include: {
                employee: true,
              },
            },
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "現場が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(site);
  } catch (error: any) {
    console.error("Site fetch error:", error);
    return NextResponse.json(
      { error: "現場の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 現場データの更新
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
    const validatedData = siteSchema.parse(body);

    // 現場が存在するかチェック
    const existingSite = await prisma.site.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSite) {
      return NextResponse.json(
        { error: "現場が見つかりません" },
        { status: 404 }
      );
    }

    // 既存の現場日データとスタッフデータを削除
    const siteDateIds = await prisma.siteDate.findMany({
      where: { siteId: params.id },
      select: { id: true },
    });
    const siteDateIdList = siteDateIds.map((d) => d.id);
    if (siteDateIdList.length > 0) {
      await prisma.siteDateEmployee.deleteMany({
        where: { siteDateId: { in: siteDateIdList } },
      });
    }
    await prisma.siteDate.deleteMany({
      where: { siteId: params.id },
    });

    // 新しい現場日データを保存
    if (body.siteDates && Array.isArray(body.siteDates)) {
      try {
        for (const siteDate of body.siteDates) {
          const createdSiteDate = await prisma.siteDate.create({
            data: {
              siteId: params.id,
              date: new Date(siteDate.date),
              startTime: siteDate.startTime
                ? new Date(siteDate.startTime)
                : null,
              endTime: siteDate.endTime ? new Date(siteDate.endTime) : null,
            },
          });

          // その日のスタッフデータを保存
          if (siteDate.employees && Array.isArray(siteDate.employees)) {
            await prisma.siteDateEmployee.createMany({
              data: siteDate.employees.map((employee: any) => ({
                siteDateId: createdSiteDate.id,
                employeeId: employee.id,
                unitPay: employee.unitPay || null,
                hourlyOvertimePay: employee.hourlyOvertimePay || null,
                userId: user.id,
              })),
            });
          }
        }
      } catch (error) {
        console.error("SiteDate update error:", error);
      }
    }

    // 更新された現場データを再取得（現場日データを含む）
    const finalSite = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        siteDates: {
          orderBy: { date: "asc" },
          include: {
            siteDateEmployees: {
              include: {
                employee: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "現場が正常に更新されました",
      site: finalSite,
    });
  } catch (error: any) {
    console.error("Site update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "現場の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// 現場データの削除
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

    // 現場が存在するかチェック
    const existingSite = await prisma.site.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSite) {
      return NextResponse.json(
        { error: "現場が見つかりません" },
        { status: 404 }
      );
    }

    // 関連するデータがあるかチェック
    const relatedSiteEmployees = await prisma.siteEmployee.findFirst({
      where: { siteId: params.id },
    });

    if (relatedSiteEmployees) {
      return NextResponse.json(
        { error: "この現場に関連するスタッフデータがあるため削除できません" },
        { status: 400 }
      );
    }

    // データベースから削除
    await prisma.site.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "現場が正常に削除されました",
    });
  } catch (error: any) {
    console.error("Site deletion error:", error);
    return NextResponse.json(
      { error: "現場の削除に失敗しました" },
      { status: 500 }
    );
  }
}
