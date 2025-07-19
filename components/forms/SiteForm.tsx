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
import { SiteInput, siteSchema } from "@/lib/validations/site";
import { Loader } from "../ui/loader";
import EmployeeSelect from "../ui/employee-select";
import DateSelector from "../ui/date-selector";

interface Client {
  id: string;
  companyName: string;
}

interface SiteFormProps {
  site?: {
    id: string;
    name: string;
    client: string;
    contactPerson: string;
    contactPhone: string;
    postalCode?: string;
    address: string;
    googleMapLink?: string;
    employeeNames?: string;
    employeeData?: any;
    siteDates?: any[];
    notes?: string;
  };
  mode: "create" | "edit";
}

export default function SiteForm({ site, mode }: SiteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<
    Array<{
      id: string;
      name: string;
      unitPay: number;
      hourlyOvertimePay: number;
    }>
  >([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<SiteInput>({
    resolver: zodResolver(siteSchema),
    defaultValues: site || {
      name: "",
      client: "",
      contactPerson: "",
      contactPhone: "",
      postalCode: "",
      address: "",
      googleMapLink: "",
      employeeNames: "",
      notes: "",
    },
  });

  // 取引先一覧を取得
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/api/clients");
        setClients(response.data.clients);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // 編集時に既存データを設定
  useEffect(() => {
    if (site && mode === "edit" && !isLoadingClients) {
      // 既存のスタッフ情報を設定
      if (site.employeeData && Array.isArray(site.employeeData)) {
        setSelectedEmployees(site.employeeData);
      } else {
        setSelectedEmployees([]);
      }

      // 既存の現場日を設定
      if (site.siteDates && Array.isArray(site.siteDates)) {
        const dates = site.siteDates.map(
          (siteDate: any) => new Date(siteDate.date)
        );
        setSelectedDates(dates);
      } else {
        setSelectedDates([]);
      }

      reset({
        name: site.name,
        client: site.client,
        contactPerson: site.contactPerson,
        contactPhone: site.contactPhone,
        postalCode: site.postalCode || "",
        address: site.address,
        googleMapLink: site.googleMapLink || "",
        employeeNames: site.employeeNames || "",
        notes: site.notes || "",
      });
    }
  }, [site, mode, isLoadingClients, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // 選択されたスタッフ情報を保存用の形式に変換
      const employeeNamesString = selectedEmployees
        .map((emp) => emp.name)
        .join(", ");
      const employeeData = selectedEmployees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        unitPay: emp.unitPay,
        hourlyOvertimePay: emp.hourlyOvertimePay,
      }));

      // 選択された現場日を保存用の形式に変換
      const siteDatesData = selectedDates.map((date) => ({
        date: date.toISOString(),
        startTime: null,
        endTime: null,
      }));

      const url = mode === "create" ? "/api/sites" : `/api/sites/${site?.id}`;
      const method = mode === "create" ? "post" : "put";

      // バリデーション対象のデータのみを送信
      const formData = {
        name: data.name,
        client: data.client,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        postalCode: data.postalCode,
        address: data.address,
        googleMapLink: data.googleMapLink,
        employeeNames: employeeNamesString,
        notes: data.notes,
      };

      await axios[method](url, {
        ...formData,
        employeeData: employeeData, // 給与計算用の詳細データ
        siteDates: siteDatesData, // 現場日データ
      });

      router.push("/sites");
      router.refresh();
    } catch (error: any) {
      console.error("Site form error:", error);
      alert(error.response?.data?.error || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "新規現場登録" : "現場情報更新"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "新しい現場の情報を入力してください"
            : "現場の情報を編集してください"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">現場名 *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="現場名を入力"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">取引先 *</Label>
              <select
                id="client"
                {...register("client")}
                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                disabled={isLoadingClients}
              >
                <option value="">取引先を選択してください</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.companyName}>
                    {client.companyName}
                  </option>
                ))}
              </select>
              {errors.client && (
                <p className="text-sm text-red-600">{errors.client.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">担当者名 *</Label>
              <Input
                id="contactPerson"
                {...register("contactPerson")}
                placeholder="担当者名を入力"
              />
              {errors.contactPerson && (
                <p className="text-sm text-red-600">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">担当者電話番号 *</Label>
              <Input
                id="contactPhone"
                {...register("contactPhone")}
                placeholder="03-1234-5678"
              />
              {errors.contactPhone && (
                <p className="text-sm text-red-600">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                {...register("postalCode")}
                placeholder="123-4567"
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所 *</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="住所を入力"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleMapLink">Googleマップリンク</Label>
              <Input
                id="googleMapLink"
                {...register("googleMapLink")}
                placeholder="https://maps.google.com/..."
              />
              {errors.googleMapLink && (
                <p className="text-sm text-red-600">
                  {errors.googleMapLink.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeNames">派遣スタッフ</Label>
              <EmployeeSelect
                value={selectedEmployees}
                onChange={setSelectedEmployees}
                placeholder="スタッフ名を入力して選択..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDates">現場日</Label>
              <DateSelector
                value={selectedDates}
                onChange={setSelectedDates}
                placeholder="現場日を選択..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              rows={4}
              {...register("notes")}
              placeholder="備考があれば入力してください"
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2" />
                  処理中...
                </>
              ) : (
                <>{mode === "create" ? "登録" : "更新"}</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/sites")}
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
