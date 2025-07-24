"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EmployeeSelect from "@/components/ui/employee-select";

interface Employee {
  id: string;
  name: string;
  unitPay: number | null;
  hourlyOvertimePay: number | null;
}

interface SiteDateFormProps {
  siteDate: {
    id: string;
    date: Date | string;
    startTime?: Date | string | null;
    endTime?: Date | string | null;
    site: {
      id: string;
      name: string;
      client: string;
      contactPerson: string;
      contactPhone: string;
      address: string;
    };
    siteDateEmployees: Array<{
      id: string;
      employee: Employee;
      unitPay?: number | null;
      hourlyOvertimePay?: number | null;
    }>;
  };
  mode: "edit";
}

export default function SiteDateForm({ siteDate, mode }: SiteDateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      startTime: siteDate.startTime
        ? new Date(siteDate.startTime).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "",
      endTime: siteDate.endTime
        ? new Date(siteDate.endTime).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "",
    },
  });

  // 既存のスタッフ情報を設定
  useEffect(() => {
    const employees = siteDate.siteDateEmployees.map((siteDateEmployee) => ({
      id: siteDateEmployee.employee.id,
      name: siteDateEmployee.employee.name,
      unitPay: siteDateEmployee.unitPay || 0,
      hourlyOvertimePay: siteDateEmployee.hourlyOvertimePay || 0,
    }));
    setSelectedEmployees(employees);
  }, [siteDate]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const url = `/api/sites/${siteDate.site.id}/date/${siteDate.id}`;

      await axios.put(url, {
        startTime: data.startTime
          ? new Date(`2000-01-01T${data.startTime}:00`).toISOString()
          : null,
        endTime: data.endTime
          ? new Date(`2000-01-01T${data.endTime}:00`).toISOString()
          : null,
        employees: selectedEmployees,
      });

      router.push(`/sites/${siteDate.site.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("SiteDate form error:", error);
      alert(error.response?.data?.error || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>現場日編集</CardTitle>
        <CardDescription>
          {formatDate(siteDate.date)}の現場情報を編集してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 現場基本情報（読み取り専用） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>現場名</Label>
              <Input value={siteDate.site.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>取引先</Label>
              <Input value={siteDate.site.client} disabled />
            </div>
            <div className="space-y-2">
              <Label>担当者</Label>
              <Input value={siteDate.site.contactPerson} disabled />
            </div>
            <div className="space-y-2">
              <Label>連絡先</Label>
              <Input value={siteDate.site.contactPhone} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>住所</Label>
              <Input value={siteDate.site.address} disabled />
            </div>
          </div>

          {/* 作業時間 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                placeholder="08:30"
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時間</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                placeholder="17:30"
              />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* 派遣スタッフ */}
          <div className="space-y-2">
            <Label htmlFor="employeeNames">スタッフ</Label>
            <EmployeeSelect
              value={selectedEmployees}
              onChange={setSelectedEmployees}
              placeholder="スタッフ名を入力して選択..."
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "更新中..." : "更新"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/sites/${siteDate.site.id}`)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
