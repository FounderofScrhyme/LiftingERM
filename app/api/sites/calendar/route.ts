import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const date = searchParams.get("date");

    let whereClause: any = {
      userId: userId,
    };

    // 特定の日付の現場を取得
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      whereClause.siteDates = {
        some: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      };
    }
    // 月間の現場を取得
    else if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      whereClause.siteDates = {
        some: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      };
    }

    const sites = await prisma.site.findMany({
      where: whereClause,
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

    return NextResponse.json({ sites });
  } catch (error: any) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "カレンダーデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}
