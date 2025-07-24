"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { employeeSchema } from "@/lib/validations/employee";
import { z } from "zod";

type EmployeeFormData = z.input<typeof employeeSchema>;
type EmployeeOutput = z.output<typeof employeeSchema>;

interface Employee extends EmployeeOutput {
  id: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  mode: "create" | "edit";
}

export default function EmployeeForm({ employee, mode }: EmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: employee
      ? {
          ...employee,
          birthdate:
            employee.birthdate instanceof Date
              ? employee.birthdate.toISOString().slice(0, 10)
              : "",
          blood_pressure: employee.blood_pressure?.toString() || "",
        }
      : {},
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const url =
        mode === "create" ? "/api/employees" : `/api/employees/${employee?.id}`;
      const method = mode === "create" ? "post" : "put";

      await axios[method](url, data);

      router.push("/employees");
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.error || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "新規スタッフ登録" : "スタッフ情報更新"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "新しいスタッフの情報を入力してください"
            : "スタッフの情報を編集してください"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="スタッフ名を入力"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号 *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="090-1234-5678"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">生年月日 *</Label>
                <Input id="birthdate" type="date" {...register("birthdate")} />
                {errors.birthdate && (
                  <p className="text-sm text-red-600">
                    {errors.birthdate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_type">血液型</Label>
                <select
                  id="blood_type"
                  {...register("blood_type")}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                >
                  <option value="">選択してください</option>
                  <option value="A">A型</option>
                  <option value="B">B型</option>
                  <option value="O">O型</option>
                  <option value="AB">AB型</option>
                </select>
              </div>
            </div>
          </div>

          {/* 緊急連絡先 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">緊急連絡先</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_person">緊急連絡先名</Label>
                <Input
                  id="emergency_contact_person"
                  {...register("emergency_contact_person")}
                  placeholder="緊急連絡先の名前"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_Phone">
                  緊急連絡先電話番号
                </Label>
                <Input
                  id="emergency_contact_Phone"
                  {...register("emergency_contact_Phone")}
                  placeholder="090-1234-5678"
                />
              </div>
            </div>
          </div>

          {/* 住所情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">住所情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">郵便番号</Label>
                <Input
                  id="postal_code"
                  {...register("postal_code")}
                  placeholder="123-4567"
                />
              </div>

              <div className="space-y-2 col-span-full">
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="住所を入力"
                />
              </div>
            </div>
          </div>

          {/* 健康情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">健康情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood_pressure">血圧</Label>
                <Input
                  id="blood_pressure"
                  {...register("blood_pressure")}
                  placeholder="例: 120/80"
                />
                {errors.blood_pressure && (
                  <p className="text-sm text-red-600">
                    {errors.blood_pressure.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 給与情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">給与情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitpay">現在の現場単価 *</Label>
                <Input
                  id="unitpay"
                  {...register("unitpay", { valueAsNumber: true })}
                  placeholder="15000"
                />
                {errors.unitpay && (
                  <p className="text-sm text-red-600">
                    {errors.unitpay.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyovertimePay">残業時給 *</Label>
                <Input
                  id="hourlyovertimePay"
                  type="number"
                  {...register("hourlyovertimePay", { valueAsNumber: true })}
                  placeholder="2000"
                />
                {errors.hourlyovertimePay && (
                  <p className="text-sm text-red-600">
                    {errors.hourlyovertimePay.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 備考 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">備考</h3>
            <div className="space-y-2">
              <Textarea
                id="notes"
                rows={4}
                {...register("notes")}
                placeholder="特記事項があれば入力してください"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : mode === "create" ? "登録" : "更新"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
