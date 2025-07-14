import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface ClientDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // ユーザーを取得
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // クライアントを取得
  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      registrarId: user.id,
    },
  });

  if (!client) {
    redirect("/clients");
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/clients">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{client.companyName}</h1>
                <p className="text-slate-500">取引先詳細</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/clients/${client.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </Button>
              </Link>
            </div>
          </div>

          {/* 基本情報 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>会社の基本情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    会社名
                  </label>
                  <p className="text-slate-900">{client.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    電話番号
                  </label>
                  <p className="text-slate-900">{client.phone || "未設定"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    郵便番号
                  </label>
                  <p className="text-slate-900">
                    {client.postalCode || "未設定"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    住所
                  </label>
                  <p className="text-slate-900">{client.address || "未設定"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 担当者情報 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>担当者情報</CardTitle>
              <CardDescription>担当者の連絡先情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    担当者名
                  </label>
                  <p className="text-slate-900">
                    {client.contactPerson || "未設定"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    担当者電話番号
                  </label>
                  <p className="text-slate-900">
                    {client.contactPhone || "未設定"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    担当者メール
                  </label>
                  <p className="text-slate-900">
                    {client.contactEmail ? (
                      <a
                        href={`mailto:${client.contactEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {client.contactEmail}
                      </a>
                    ) : (
                      "未設定"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 備考 */}
          {client.notes && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>備考</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-900 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 登録情報 */}
          <Card>
            <CardHeader>
              <CardTitle>登録情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    登録日
                  </label>
                  <p className="text-slate-900">
                    {new Date(client.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    最終更新日
                  </label>
                  <p className="text-slate-900">
                    {new Date(client.updatedAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
