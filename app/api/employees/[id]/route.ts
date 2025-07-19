import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { employeeSchema } from "@/lib/validations/employee";

// GET: 特定のスタッフ情報を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // IDの形式チェック
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "無効なスタッフIDです" },
        { status: 400 }
      );
    }

    // スタッフ情報を取得
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        birthDate: true,
        bloodType: true,
        bloodPressure: true,
        unitPay: true,
        hourlyOvertimePay: true,
        emergencyContactPerson: true,
        emergencyContactPhone: true,
        address: true,
        postalCode: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "スタッフが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return NextResponse.json(
      { error: "スタッフ情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT: スタッフ情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // IDの形式チェック
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "無効なスタッフIDです" },
        { status: 400 }
      );
    }

    // リクエストボディを取得
    const body = await request.json();

    // 既存のスタッフを確認
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: "スタッフが見つかりません" },
        { status: 404 }
      );
    }

    // バリデーション
    const validationResult = employeeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // 血圧の処理
    let bloodPressure = null;
    if (validatedData.blood_pressure) {
      // 120/80 のような形式を数値に変換（収縮期血圧のみを保存）
      const parts = validatedData.blood_pressure.split("/");
      if (parts.length === 2) {
        const systolic = parseInt(parts[0]);
        if (!isNaN(systolic)) {
          bloodPressure = systolic;
        }
      }
    }

    // スタッフ情報を更新
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        birthDate: validatedData.birthdate,
        bloodType: validatedData.blood_type || null,
        bloodPressure,
        unitPay: validatedData.unitpay,
        hourlyOvertimePay: validatedData.hourlyovertimePay,
        emergencyContactPerson: validatedData.emergency_contact_person || null,
        emergencyContactPhone: validatedData.emergency_contact_Phone || null,
        address: validatedData.address || null,
        postalCode: validatedData.postal_code || null,
        notes: validatedData.notes || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        birthDate: true,
        bloodType: true,
        bloodPressure: true,
        unitPay: true,
        hourlyOvertimePay: true,
        emergencyContactPerson: true,
        emergencyContactPhone: true,
        address: true,
        postalCode: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "スタッフ情報が正常に更新されました",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Failed to update employee:", error);

    // Prismaのエラーハンドリング
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "この電話番号は既に使用されています" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "スタッフ情報の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: スタッフを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // IDの形式チェック
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "無効なスタッフIDです" },
        { status: 400 }
      );
    }

    // 既存のスタッフを確認
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: "スタッフが見つかりません" },
        { status: 404 }
      );
    }

    // スタッフを削除
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "スタッフが正常に削除されました",
    });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json(
      { error: "スタッフの削除に失敗しました" },
      { status: 500 }
    );
  }
}
