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
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

interface SalesDetailPageProps {
  params: {
    id: string;
  };
}

export default async function SalesDetailPage({
  params,
}: SalesDetailPageProps) {
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

  // 売上データを取得
  const sales = await prisma.sales.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });

  if (!sales) {
    redirect("/sales");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/sales">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">売上詳細</h1>
              <p className="text-slate-600">{sales.client.companyName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/sales/${sales.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Button>
            </Link>
          </div>
        </div>

        {/* 売上情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>売上情報</CardTitle>
            <CardDescription>売上の詳細情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  取引先
                </label>
                <p className="text-slate-900">{sales.client.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  売上金額
                </label>
                <p className="font-semibold text-green-600">
                  ¥{sales.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  売上日
                </label>
                <p className="text-slate-900">
                  {new Date(sales.date).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  登録日
                </label>
                <p className="text-slate-900">
                  {new Date(sales.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 備考 */}
        {sales.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>備考</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-900 whitespace-pre-wrap">
                {sales.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 更新情報 */}
        <Card>
          <CardHeader>
            <CardTitle>更新情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  最終更新日
                </label>
                <p className="text-slate-900">
                  {new Date(sales.updatedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
