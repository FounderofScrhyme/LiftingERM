"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableLoader } from "@/components/ui/loader";
import { Calculator, Download } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Employee {
  id: string;
  name: string;
  unitPay: number | null;
  hourlyOvertimePay: number | null;
}

interface AssignmentDetail {
  date: string;
  siteName: string;
  unitPayCondition: string;
  effectiveUnitPay: number;
}

interface PayrollCalculation {
  employeeId: string;
  employeeName: string;
  unitPay: number;
  hourlyOvertimePay: number;
  totalAssignments: number;
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  totalSalary: number;
  assignmentDetails: AssignmentDetail[];
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // 従業員一覧を取得
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/api/employees");
        setEmployees(response.data.employees);
      } catch (error: any) {
        setError("従業員データの取得に失敗しました");
      }
    };

    fetchEmployees();
  }, []);

  // 給与計算
  const handleCalculate = async () => {
    if (!selectedEmployeeId || !startDate || !endDate) {
      setError("従業員と期間を選択してください");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post("/api/payroll/calculate", {
        employeeId: selectedEmployeeId,
        startDate,
        endDate,
      });

      setCalculation(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "給与計算に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 初期日付設定
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              給与計算
            </CardTitle>
            <CardDescription>
              従業員の単価と現場派遣回数に基づいて給与を計算します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 従業員選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  従業員を選択
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                >
                  <option value="">従業員を選択してください</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} (単価: ¥
                      {employee.unitPay?.toLocaleString() || "未設定"})
                    </option>
                  ))}
                </select>
              </div>

              {/* 期間選択 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    終了日
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* 計算ボタン */}
              <Button
                onClick={handleCalculate}
                disabled={
                  isLoading || !selectedEmployeeId || !startDate || !endDate
                }
                className="w-full"
              >
                {isLoading ? (
                  <TableLoader />
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    給与計算
                  </>
                )}
              </Button>

              {/* エラー表示 */}
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </CardContent>
        </Card>

        {/* 計算結果表示 */}
        {calculation && (
          <Card>
            <CardHeader>
              <CardTitle>計算結果</CardTitle>
              <CardDescription>
                {calculation.employeeName} - {startDate} 〜 {endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-600">基本単価</div>
                    <div className="text-lg font-semibold">
                      ¥{calculation.unitPay?.toLocaleString() || "未設定"}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-600">現場数</div>
                    <div className="text-lg font-semibold">
                      {calculation.totalAssignments}現場
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">基本給</div>
                    <div className="text-2xl font-bold text-green-700">
                      ¥{calculation.baseSalary?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>

                {/* 派遣詳細 */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-4">派遣詳細</h4>
                  <div className="space-y-2">
                    {calculation.assignmentDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-white border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{detail.siteName}</div>
                          <div className="text-sm text-slate-500">
                            {new Date(detail.date).toLocaleDateString("ja-JP")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500">
                            {detail.unitPayCondition === "normal" && "通常"}
                            {detail.unitPayCondition === "half" && "割"}
                            {detail.unitPayCondition === "6000" && "固定6000円"}
                            {detail.unitPayCondition === "5000" && "固定5000円"}
                            {detail.unitPayCondition === "3000" && "固定3000円"}
                          </div>
                          <div className="font-semibold text-green-600">
                            ¥{detail.effectiveUnitPay.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
