"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";

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

export default function EmployeeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/employees/${params.id}`);
        setEmployee(response.data.employee);
      } catch (error: any) {
        console.error("Failed to fetch employee:", error);
        setError(
          error.response?.data?.error || "スタッフデータの取得に失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("このスタッフデータを削除しますか？")) {
      return;
    }

    try {
      await axios.delete(`/api/employees/${params.id}`);
      router.push("/employees");
    } catch (error: any) {
      alert(error.response?.data?.error || "削除に失敗しました");
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                <p>{error || "スタッフが見つかりません"}</p>
                <Button
                  onClick={() => router.push("/employees")}
                  className="mt-4"
                >
                  スタッフ一覧に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/employees")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            スタッフ一覧に戻る
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{employee.name}</h1>
              <p className="text-slate-600">スタッフ詳細情報</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/employees/${employee.id}/edit`)}
                className="bg-white text-green-600 hover:text-green-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                編集
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="bg-white text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">名前</p>
                  <p className="text-lg">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">年齢</p>
                  <p className="text-lg">
                    {calculateAge(employee.birthDate)}歳
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">電話番号</p>
                  <p className="text-lg">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">生年月日</p>
                  <p className="text-lg">{formatDate(employee.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">血液型</p>
                  <p className="text-lg">{employee.bloodType || "未設定"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">血圧</p>
                  <p className="text-lg">
                    {employee.bloodPressure
                      ? `${employee.bloodPressure}/--`
                      : "未設定"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 給与情報 */}
          <Card>
            <CardHeader>
              <CardTitle>給与情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">時給単価</p>
                  <p className="text-lg font-semibold text-green-600">
                    ¥{employee.unitPay?.toLocaleString() || "未設定"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">残業時給</p>
                  <p className="text-lg font-semibold text-green-600">
                    ¥{employee.hourlyOvertimePay?.toLocaleString() || "未設定"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 緊急連絡先 */}
          <Card>
            <CardHeader>
              <CardTitle>緊急連絡先</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  緊急連絡先名
                </p>
                <p className="text-lg">
                  {employee.emergencyContactPerson || "未設定"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  緊急連絡先電話番号
                </p>
                <p className="text-lg">
                  {employee.emergencyContactPhone || "未設定"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 住所情報 */}
          <Card>
            <CardHeader>
              <CardTitle>住所情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600">郵便番号</p>
                <p className="text-lg">{employee.postalCode || "未設定"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">住所</p>
                <p className="text-lg">{employee.address || "未設定"}</p>
              </div>
            </CardContent>
          </Card>

          {/* 備考 */}
          {employee.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>備考</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{employee.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* 登録情報 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>登録情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">登録日</p>
                  <p className="text-lg">{formatDate(employee.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">更新日</p>
                  <p className="text-lg">{formatDate(employee.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
