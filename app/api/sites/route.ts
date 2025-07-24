import prisma from "@/lib/prisma";
import { siteSchema } from "@/lib/validations/site";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// 現場データの作成
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
    const validatedData = siteSchema.parse(body);

    // データベースに保存
    const site = await prisma.site.create({
      data: {
        name: validatedData.name,
        client: validatedData.client,
        contactPerson: validatedData.contactPerson,
        contactPhone: validatedData.contactPhone,
        postalCode: validatedData.postalCode || null,
        address: validatedData.address,
        googleMapLink: validatedData.googleMapLink || null,
        employeeNames: validatedData.employeeNames || null,
        employeeData: body.employeeData || null,
        notes: validatedData.notes || null,
        userId: user.id,
      },
    });

    // 現場日データを保存
    if (body.siteDates && Array.isArray(body.siteDates)) {
      try {
        for (const siteDate of body.siteDates) {
          // JSTの0時で保存
          const dateObj = new Date(siteDate.date);
          const jstDate = new Date(
            dateObj.getTime() -
              dateObj.getTimezoneOffset() * 60000 +
              9 * 60 * 60000
          );
          const createdSiteDate = await prisma.siteDate.create({
            data: {
              siteId: site.id,
              date: jstDate,
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
        console.error("SiteDate creation error:", error);
        // 現場日データの保存に失敗しても現場自体は保存する
      }
    }

    return NextResponse.json(
      {
        message: "現場が正常に登録されました",
        site,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Site creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "現場の登録に失敗しました" },
      { status: 500 }
    );
  }
}

// 現場データの一覧取得
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
    const month = searchParams.get("month") || "";
    const recent = searchParams.get("recent") || "";

    // サジェスト用: recent=1 の場合は過去30日以内の現場名候補のみ返す
    if (recent === "1") {
      const now = new Date();
      const before30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const where: any = {
        userId: user.id,
        createdAt: { gte: before30 },
        ...(search && {
          name: { contains: search, mode: "insensitive" as const },
        }),
      };
      const sites = await prisma.site.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          client: true,
          contactPerson: true,
          contactPhone: true,
          postalCode: true,
          address: true,
          googleMapLink: true,
          notes: true,
        },
      });
      return NextResponse.json({ sites });
    }

    // オフセットを計算
    const offset = (page - 1) * limit;

    // 検索条件を構築
    const where: any = {
      userId: user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { client: { contains: search, mode: "insensitive" as const } },
          { contactPerson: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // 月フィルターを追加
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

      where.siteDates = {
        some: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      };
    }

    // データを取得
    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.site.count({ where }),
    ]);

    return NextResponse.json({
      sites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Site fetch error:", error);
    return NextResponse.json(
      { error: "現場の取得に失敗しました" },
      { status: 500 }
    );
  }
}
