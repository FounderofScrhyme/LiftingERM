"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
import DateTimeSelector from "../ui/date-time-selector";

interface Client {
  id: string;
  companyName: string;
}

interface SiteSuggestion {
  id: string;
  name: string;
  client: string;
  contactPerson: string;
  contactPhone: string;
  postalCode?: string;
  address: string;
  googleMapLink?: string;
  notes?: string;
  startTime?: string;
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
  initialDate?: Date | null;
}

export default function SiteForm({ site, mode, initialDate }: SiteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  // 単一日付に変更
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateStartTime, setDateStartTime] = useState<string>("");
  const [dateEmployees, setDateEmployees] = useState<
    Array<{
      id: string;
      name: string;
      unitPay: number | null;
      hourlyOvertimePay: number | null;
    }>
  >([]);

  // サジェスト用
  const [siteSuggestions, setSiteSuggestions] = useState<SiteSuggestion[]>([]);
  const [siteNameInput, setSiteNameInput] = useState(site?.name || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

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

  // サジェスト取得
  useEffect(() => {
    if (siteNameInput.length === 0) {
      setSiteSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(
          `/api/sites?search=${encodeURIComponent(siteNameInput)}&recent=1`
        );
        if (res.data && Array.isArray(res.data.sites)) {
          setSiteSuggestions(res.data.sites);
        }
      } catch (e) {
        setSiteSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [siteNameInput]);

  // サジェスト選択時の自動入力
  const handleSuggestionSelect = (suggestion: SiteSuggestion) => {
    setSiteNameInput(suggestion.name);
    setValue("name", suggestion.name);
    setValue("client", suggestion.client);
    setValue("contactPerson", suggestion.contactPerson);
    setValue("contactPhone", suggestion.contactPhone);
    setValue("postalCode", suggestion.postalCode || "");
    setValue("address", suggestion.address);
    setValue("googleMapLink", suggestion.googleMapLink || "");
    setValue("notes", suggestion.notes || "");
    // 選択した日付（selectedDate）は維持し、スタッフ欄のみ空欄に
    // 開始時間を元データからセット（なければ空欄）
    if (suggestion.startTime) {
      const t = new Date(suggestion.startTime).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setDateStartTime(t);
    } else {
      setDateStartTime("");
    }
    setDateEmployees([]); // スタッフ欄も空欄
    setShowSuggestions(false);
  };

  // サジェストの外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 初期値としてinitialDateが渡された場合、selectedDateにセット
  useEffect(() => {
    if (mode === "create" && initialDate) {
      setSelectedDate(initialDate);
    }
  }, [mode, initialDate]);

  // 編集時の既存データセット
  useEffect(() => {
    if (site && mode === "edit" && !isLoadingClients) {
      // 単一日付化
      if (
        site.siteDates &&
        Array.isArray(site.siteDates) &&
        site.siteDates.length > 0
      ) {
        const date = new Date(site.siteDates[0].date);
        setSelectedDate(date);
        setDateStartTime(
          site.siteDates[0].startTime
            ? new Date(site.siteDates[0].startTime).toLocaleTimeString(
                "ja-JP",
                { hour: "2-digit", minute: "2-digit", hour12: false }
              )
            : ""
        );
        setDateEmployees(
          site.siteDates[0].siteDateEmployees?.map((e: any) => ({
            id: e.employee.id,
            name: e.employee.name,
            unitPay: e.unitPay,
            hourlyOvertimePay: e.hourlyOvertimePay,
          })) || []
        );
      } else {
        setSelectedDate(null);
        setDateStartTime("");
        setDateEmployees([]);
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
      // 単一日付用データ整形
      let siteDatesData: Array<{
        date: string;
        startTime: string | null;
        endTime: null;
        employees: typeof dateEmployees;
      }> = [];
      if (selectedDate) {
        // JSTの0時でISO文字列を生成
        const y = selectedDate.getFullYear();
        const m = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const d = selectedDate.getDate().toString().padStart(2, "0");
        const dateIsoJst = `${y}-${m}-${d}T00:00:00+09:00`;
        const dateKey = `${y}-${m}-${d}`;
        siteDatesData = [
          {
            date: dateIsoJst,
            startTime: dateStartTime
              ? new Date(`${dateKey}T${dateStartTime}:00+09:00`).toISOString()
              : null,
            endTime: null,
            employees: dateEmployees,
          },
        ];
      }
      const employeeNamesString = dateEmployees
        .map((emp) => emp.name)
        .join(", ");
      const url = mode === "create" ? "/api/sites" : `/api/sites/${site?.id}`;
      const method = mode === "create" ? "post" : "put";
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
        siteDates: siteDatesData,
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
            <div className="space-y-2" ref={suggestionRef}>
              <Label htmlFor="name">現場名 *</Label>
              <Input
                id="name"
                {...register("name")}
                value={siteNameInput}
                onChange={(e) => {
                  setSiteNameInput(e.target.value);
                  setValue("name", e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="現場名を入力"
                autoComplete="off"
              />
              {showSuggestions && siteSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {siteSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-slate-50"
                      onClick={() => handleSuggestionSelect(s)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
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

            {/* 日付・開始時間・スタッフを分離 */}
            <div className="space-y-2">
              <Label htmlFor="siteDate">現場日 *</Label>
              <Input
                id="siteDate"
                type="date"
                value={
                  selectedDate
                    ? `${selectedDate.getFullYear()}-${(
                        selectedDate.getMonth() + 1
                      )
                        .toString()
                        .padStart(2, "0")}-${selectedDate
                        .getDate()
                        .toString()
                        .padStart(2, "0")}`
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    // JSTの0時でDateを生成
                    setSelectedDate(
                      new Date(`${e.target.value}T00:00:00+09:00`)
                    );
                  } else {
                    setSelectedDate(null);
                  }
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間 *</Label>
              <select
                id="startTime"
                value={dateStartTime}
                onChange={(e) => setDateStartTime(e.target.value)}
                required
                disabled={isLoading}
                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {Array.from({ length: 24 }).map((_, h) => [
                  <option
                    key={`${h}:00`}
                    value={`${h.toString().padStart(2, "0")}:00`}
                  >{`${h.toString().padStart(2, "0")}:00`}</option>,
                  <option
                    key={`${h}:30`}
                    value={`${h.toString().padStart(2, "0")}:30`}
                  >{`${h.toString().padStart(2, "0")}:30`}</option>,
                ])}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">スタッフ</Label>
              <EmployeeSelect
                value={dateEmployees}
                onChange={setDateEmployees}
                placeholder="スタッフを選択..."
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
