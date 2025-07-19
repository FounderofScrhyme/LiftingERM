"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/forms/EmployeeForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

export default function EmployeeEditPage({
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">読み込み中...</div>
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
            onClick={() => router.push(`/employees/${employee.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            詳細に戻る
          </Button>
        </div>

        <EmployeeForm
          employee={{
            ...employee,
            birthdate: new Date(employee.birthDate),
            blood_pressure: employee.bloodPressure
              ? `${employee.bloodPressure}/--`
              : "",
            unitpay: employee.unitPay || 0,
            hourlyovertimePay: employee.hourlyOvertimePay || 0,
            address: employee.address || undefined,
            postal_code: employee.postalCode || undefined,
            emergency_contact_person:
              employee.emergencyContactPerson || undefined,
            emergency_contact_Phone:
              employee.emergencyContactPhone || undefined,
            notes: employee.notes || undefined,
          }}
          mode="edit"
        />
      </div>
    </DashboardLayout>
  );
}
