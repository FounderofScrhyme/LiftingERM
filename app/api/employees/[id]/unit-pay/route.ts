import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 単価変更履歴を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;

    // 従業員の存在確認
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        unitPay: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "従業員が見つかりません" },
        { status: 404 }
      );
    }

    // 単価変更履歴を取得
    const unitPayHistory = await prisma.unitPayHistory.findMany({
      where: {
        employeeId: employeeId,
      },
      orderBy: {
        effectiveDate: "desc",
      },
    });

    return NextResponse.json({
      employee,
      unitPayHistory,
    });
  } catch (error) {
    console.error("単価履歴取得エラー:", error);
    return NextResponse.json(
      { error: "単価履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 単価変更履歴を追加
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    const { unitPay, effectiveDate } = await request.json();

    if (!unitPay || !effectiveDate) {
      return NextResponse.json(
        { error: "単価と有効開始日は必須です" },
        { status: 400 }
      );
    }

    // 従業員の存在確認
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "従業員が見つかりません" },
        { status: 404 }
      );
    }

    // 単価変更履歴を追加
    const unitPayHistory = await prisma.unitPayHistory.create({
      data: {
        employeeId: employeeId,
        unitPay: unitPay,
        effectiveDate: new Date(effectiveDate),
      },
    });

    return NextResponse.json({
      message: "単価変更履歴が追加されました",
      unitPayHistory,
    });
  } catch (error) {
    console.error("単価変更履歴追加エラー:", error);
    return NextResponse.json(
      { error: "単価変更履歴の追加に失敗しました" },
      { status: 500 }
    );
  }
}
