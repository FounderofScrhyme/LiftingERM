"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { TableLoader } from "../ui/loader";
import { ArrowRight, Edit2, Trash2, Plus } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  phone: string;
  birthDate: string;
  bloodType: string | null;
  bloodPressure: number | null;
  unitPay: number | null;
  hourlyOvertimePay: number | null;
  emergencyContactPerson: string | null;
  emergencyContactPhone: string | null;
  address: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface EmployeeListResponse {
  employees: Employee[];
  pagination: Pagination;
}

export default function EmployeeList() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // スタッフ一覧を取得
  const fetchEmployees = async (page: number = 1, searchTerm: string = "") => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get<EmployeeListResponse>(
        `/api/employees?${params}`
      );
      setEmployees(response.data.employees);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Failed to fetch employees:", error);
      setError(
        error.response?.data?.error || "スタッフデータの取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchEmployees(1, search);
  }, []);

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees(1, search);
  };

  // ページ変更
  const handlePageChange = (newPage: number) => {
    fetchEmployees(newPage, search);
  };

  // スタッフ削除
  const handleDelete = async (employeeId: string) => {
    if (!confirm("このスタッフデータを削除しますか？")) {
      return;
    }

    try {
      await axios.delete(`/api/employees/${employeeId}`);
      // 削除後に一覧を再取得
      fetchEmployees(pagination.page, search);
    } catch (error: any) {
      alert(error.response?.data?.error || "削除に失敗しました");
    }
  };

  // 年齢計算
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (error) {
    return (
      <Card className="max-w-6xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => fetchEmployees()} className="mt-4">
              再試行
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>スタッフ一覧</CardTitle>
            <CardDescription className="pt-2">
              登録されているスタッフデータの一覧です
            </CardDescription>
          </div>
          {/* <Button onClick={() => router.push("/employees/new")}>
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button> */}
        </div>
      </CardHeader>
      <CardContent>
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                スタッフ名で検索
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="スタッフ名を入力"
                className="border border-slate-300 rounded-md px-3 py-2 w-64"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="h-10">
              検索
            </Button>
          </div>
        </form>

        {/* ローディング表示 */}
        {isLoading && <TableLoader />}

        {/* スタッフ一覧 */}
        {!isLoading && employees.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">スタッフデータが登録されていません</p>
            <Button
              onClick={() => router.push("/employees/new")}
              className="mt-4"
            >
              最初のスタッフを登録
            </Button>
          </div>
        )}

        {!isLoading && employees.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      名前
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      年齢
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      電話番号
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      血液型
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      現場単価
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      残業代単価
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      緊急連絡先
                    </th>
                    <th className="text-left p-4 font-medium whitespace-nowrap">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-medium">{employee.name}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-slate-600">
                          {calculateAge(employee.birthDate)}歳
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-slate-600">{employee.phone}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-slate-600">
                          {employee.bloodType || "未設定"}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">
                          ¥{employee.unitPay?.toLocaleString() || "未設定"}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">
                          ¥
                          {employee.hourlyOvertimePay?.toLocaleString() ||
                            "未設定"}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          <div>
                            {employee.emergencyContactPerson || "未設定"}
                          </div>
                          <div className="text-xs">
                            {employee.emergencyContactPhone || ""}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/employees/${employee.id}`)
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            詳細
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/employees/${employee.id}/edit`)
                            }
                            className="text-green-500 hover:text-green-700"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  前へ
                </Button>

                <span className="text-sm">
                  {pagination.page} / {pagination.totalPages} ページ (
                  {pagination.total}件中{" "}
                  {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                  件)
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  次へ
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
