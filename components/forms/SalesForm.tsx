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
import { SalesInput, salesSchema } from "@/lib/validations/sales";

interface Client {
  id: string;
  companyName: string;
}

interface Sales extends SalesInput {
  id: string;
}

interface SalesFormProps {
  sales?: Sales;
  mode: "create" | "edit";
}

export default function SalesForm({ sales, mode }: SalesFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<SalesInput>({
    resolver: zodResolver(salesSchema),
    defaultValues: sales || {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
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
    if (sales && mode === "edit" && !isLoadingClients) {
      reset({
        clientId: sales.clientId,
        amount: sales.amount,
        date: sales.date,
        notes: sales.notes || "",
      });
    }
  }, [sales, mode, isLoadingClients, reset]);

  const onSubmit = async (data: SalesInput) => {
    setIsLoading(true);
    try {
      const url = mode === "create" ? "/api/sales" : `/api/sales/${sales?.id}`;
      const method = mode === "create" ? "post" : "put";

      await axios[method](url, data);

      router.push("/sales");
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.error || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "新規売上登録" : "売上情報更新"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "新しい売上データを入力してください"
            : "売上データを編集してください"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">取引先 *</Label>
              <select
                id="clientId"
                {...register("clientId")}
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                disabled={isLoadingClients}
              >
                <option value="">取引先を選択してください</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-sm text-slate-600">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">売上金額 *</Label>
                <Input
                  id="amount"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="100000"
                  min="0"
                />
                {errors.amount && (
                  <p className="text-sm text-slate-600">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">売上日 *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-sm text-slate-600">
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                rows={4}
                {...register("notes")}
                placeholder="売上に関する備考があれば入力してください"
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
            <Button type="submit" disabled={isLoading || isLoadingClients}>
              {isLoading ? "保存中..." : mode === "create" ? "登録" : "更新"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
