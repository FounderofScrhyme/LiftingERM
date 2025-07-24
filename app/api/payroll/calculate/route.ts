import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { employeeId, startDate, endDate } = await request.json();

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "従業員ID、開始日、終了日は必須です" },
        { status: 400 }
      );
    }

    // 従業員情報を取得
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        unitPay: true,
        hourlyOvertimePay: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "従業員が見つかりません" },
        { status: 404 }
      );
    }

    if (!employee.unitPay) {
      return NextResponse.json(
        { error: "従業員の単価が設定されていません" },
        { status: 400 }
      );
    }

    // 指定期間中の現場派遣日を取得
    const siteDates = await prisma.siteDate.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        siteDateEmployees: {
          some: {
            employeeId: employeeId,
          },
        },
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            unitPayCondition: true,
          },
        },
        siteDateEmployees: {
          where: {
            employeeId: employeeId,
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 派遣回数を計算（各現場日を1回としてカウント）
    const totalAssignments = siteDates.length;

    // 各派遣日の単価を計算（現場の単価条件を考慮、必ずnormalをデフォルトにする）
    let calculatedSalary = 0;
    for (const siteDate of siteDates) {
      let effectiveUnitPay = employee.unitPay || 0;
      const unitPayCondition =
        siteDate.site.unitPayCondition && siteDate.site.unitPayCondition !== ""
          ? siteDate.site.unitPayCondition
          : "normal";
      switch (unitPayCondition) {
        case "normal":
          effectiveUnitPay = employee.unitPay || 0;
          break;
        case "half":
          effectiveUnitPay = Math.floor((employee.unitPay || 0) / 2);
          break;
        case "6000":
          effectiveUnitPay = 6000;
          break;
        case "5000":
          effectiveUnitPay = 5000;
          break;
        case "3000":
          effectiveUnitPay = 3000;
          break;
        default:
          effectiveUnitPay = employee.unitPay || 0;
      }
      calculatedSalary += effectiveUnitPay;
    }

    // 基本給を計算（各日の単価の合計）
    const baseSalary = calculatedSalary;
    const totalSalary = baseSalary;

    // 各派遣日の詳細情報を収集
    const assignmentDetails = siteDates.map((siteDate) => {
      let effectiveUnitPay = employee.unitPay || 0;
      const unitPayCondition =
        siteDate.site.unitPayCondition && siteDate.site.unitPayCondition !== ""
          ? siteDate.site.unitPayCondition
          : "normal";
      switch (unitPayCondition) {
        case "normal":
          effectiveUnitPay = employee.unitPay || 0;
          break;
        case "half":
          effectiveUnitPay = Math.floor((employee.unitPay || 0) / 2);
          break;
        case "6000":
          effectiveUnitPay = 6000;
          break;
        case "5000":
          effectiveUnitPay = 5000;
          break;
        case "3000":
          effectiveUnitPay = 3000;
          break;
        default:
          effectiveUnitPay = employee.unitPay || 0;
      }
      return {
        date: siteDate.date,
        siteName: siteDate.site.name,
        unitPayCondition: unitPayCondition,
        effectiveUnitPay,
      };
    });

    const calculation = {
      employeeId: employee.id,
      employeeName: employee.name,
      unitPay: employee.unitPay || 0,
      hourlyOvertimePay: employee.hourlyOvertimePay || 0,
      totalAssignments,
      baseSalary,
      overtimeHours: 0,
      overtimePay: 0,
      totalSalary,
      assignmentDetails,
    };

    return NextResponse.json(calculation);
  } catch (error) {
    console.error("給与計算エラー:", error);
    return NextResponse.json(
      { error: "給与計算に失敗しました" },
      { status: 500 }
    );
  }
}
