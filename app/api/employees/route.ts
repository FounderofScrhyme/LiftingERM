import prisma from "@/lib/prisma";
import { employeeSchema } from "@/lib/validations/employee";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { toast } from "sonner";

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
    const validatedData = employeeSchema.parse(body);

    const employee = await prisma.employee.create({
      data: {
        registrarId: user.id,
        name: validatedData.name,
        phone: validatedData.phone,
        birthDate: validatedData.birthdate,
        bloodType: validatedData.blood_type,
        bloodPressure: validatedData.blood_pressure
          ? parseInt(validatedData.blood_pressure.replace(/[^0-9]/g, ""))
          : null,
        unitPay: validatedData.unitpay,
        hourlyOvertimePay: validatedData.hourlyovertimePay,
        notes: validatedData.notes,
        emergencyContactPerson: validatedData.emergency_contact_person,
        emergencyContactPhone: validatedData.emergency_contact_Phone,
        address: validatedData.address,
        postalCode: validatedData.postal_code,
      },
    });

    return NextResponse.json(
      {
        message: "スタッフが正常に登録されました",
        employee,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Employee creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "入力データが正しくありません", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "スタッフの登録に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    const where = {
      registrarId: user.id,
      ...(search && {
        OR: [{ name: { contains: search, mode: "insensitive" as const } }],
      }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.log("Employee retrieval error:", error);
    toast.error("スタッフの取得に失敗しました");
    return NextResponse.json(
      { error: "スタッフの取得に失敗しました" },
      { status: 500 }
    );
  }
}
