"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { ClientInput, clientSchema } from "@/lib/validations/client";

interface Client extends ClientInput {
  id: string;
}

interface ClientFormProps {
  client?: Client;
  mode: "create" | "edit";
}

export default function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {},
  });

  const onSubmit = async (data: ClientInput) => {
    setIsLoading(true);
    try {
      const url =
        mode === "create" ? "/api/clients" : `/api/clients/${client?.id}`;
      const method = mode === "create" ? "post" : "put";

      await axios[method](url, data);

      router.push("/clients");
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
          {mode === "create" ? "新規取引先登録" : "取引先情報更新"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "新しい取引先の情報を入力してください"
            : "取引先の情報を編集してください"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">会社名 *</Label>
              <Input
                id="company_name"
                {...register("company_name")}
                placeholder="会社名を入力"
              />
              {errors.company_name && (
                <p className="text-sm text-slate-600">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">電話番号 *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="03-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-slate-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">郵便番号</Label>
              <Input
                id="postal_code"
                {...register("postal_code")}
                placeholder="777-7777"
              />
              {errors.postal_code && (
                <p className="text-sm text-slate-600">
                  {errors.postal_code.message}
                </p>
              )}
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">担当者情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">担当者名 *</Label>
                <Input id="contact_person" {...register("contact_person")} />
                {errors.contact_person && (
                  <p className="text-sm text-slate-600">
                    {errors.contact_person.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">担当者電話番号 *</Label>
                <Input id="contact_phone" {...register("contact_phone")} />
                {errors.contact_phone && (
                  <p className="text-sm text-slate-600">
                    {errors.contact_phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">担当者メール</Label>
                <Input id="contact_email" {...register("contact_email")} />
                {errors.contact_email && (
                  <p className="text-sm text-slate-600">
                    {errors.contact_email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 col-span-full">
                <Label htmlFor="notes">備考</Label>
                <Textarea id="notes" rows={4} {...register("notes")} />
              </div>
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
