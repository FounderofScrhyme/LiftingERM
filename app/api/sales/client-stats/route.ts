import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// 取引先ごとの売上統計を取得
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
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "取引先IDが必要です" },
        { status: 400 }
      );
    }

    // 取引先が存在するかチェック
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        registrarId: user.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "指定された取引先が見つかりません" },
        { status: 404 }
      );
    }

    // 取引先の売上総額を取得
    const totalSales = await prisma.sales.aggregate({
      where: {
        userId: user.id,
        clientId: clientId,
      },
      _sum: {
        amount: true,
      },
    });

    // 月別売上を取得（過去12ヶ月）
    const monthlySales = await prisma.sales.findMany({
      where: {
        userId: user.id,
        clientId: clientId,
        date: {
          gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 11,
            1
          ),
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        date: true,
        amount: true,
      },
    });

    // 月別データを整形
    const monthlyData: {
      year: number;
      month: number;
      amount: number;
      label: string;
    }[] = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      // その月の売上を集計
      const monthSales = monthlySales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getFullYear() === year &&
          saleDate.getMonth() === targetDate.getMonth()
        );
      });

      const monthTotal = monthSales.reduce(
        (sum, sale) => sum + (sale.amount || 0),
        0
      );

      monthlyData.push({
        year,
        month,
        amount: monthTotal,
        label: `${year}年${month}月`,
      });
    }

    return NextResponse.json({
      client: {
        id: client.id,
        companyName: client.companyName,
      },
      totalAmount: totalSales._sum.amount || 0,
      monthlyData,
    });
  } catch (error: any) {
    console.error("Client sales stats error:", error);
    return NextResponse.json(
      { error: "売上統計の取得に失敗しました" },
      { status: 500 }
    );
  }
}
