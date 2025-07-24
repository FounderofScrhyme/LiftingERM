import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit2,
  MapPin,
  Phone,
  User,
  Building2,
  Calendar,
  Users,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface SiteDetailPageProps {
  params: {
    id: string;
  };
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
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

  // 現場を取得
  const site = await prisma.site.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      siteDates: {
        orderBy: { date: "asc" },
        include: {
          siteDateEmployees: {
            include: {
              employee: true,
            },
          },
        },
      },
    },
  });

  if (!site) {
    redirect("/sites");
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/sites">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{site.name}</h1>
              <p className="text-slate-600">現場詳細情報</p>
            </div>
          </div>
          <Link href={`/sites/${site.id}/edit`}>
            <Button>
              <Edit2 className="w-4 h-4 mr-2" />
              編集
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                基本情報
              </CardTitle>
              <CardDescription>現場の基本情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    現場名
                  </label>
                  <p className="text-slate-900 font-medium">{site.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    取引先
                  </label>
                  <p className="text-slate-900">{site.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    担当者名
                  </label>
                  <p className="text-slate-900">{site.contactPerson}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    担当者電話番号
                  </label>
                  <p className="text-slate-900">{site.contactPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    郵便番号
                  </label>
                  <p className="text-slate-900">
                    {site.postalCode || "未設定"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    住所
                  </label>
                  <p className="text-slate-900">{site.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 派遣スタッフ情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                派遣スタッフ
              </CardTitle>
              <CardDescription>現場に派遣されているスタッフ</CardDescription>
            </CardHeader>
            <CardContent>
              {site.employeeNames ? (
                <div className="flex flex-wrap gap-2">
                  {site.employeeNames.split(",").map((name, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {name.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">
                  派遣スタッフが設定されていません
                </p>
              )}
            </CardContent>
          </Card>

          {/* 現場日情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                現場日
              </CardTitle>
              <CardDescription>現場の作業日</CardDescription>
            </CardHeader>
            <CardContent>
              {site.siteDates.length > 0 ? (
                <div className="space-y-2">
                  {site.siteDates.map((siteDate, index) => (
                    <div
                      key={siteDate.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {formatDate(siteDate.date.toString())}
                        </p>
                        {siteDate.startTime && siteDate.endTime && (
                          <p className="text-sm text-slate-600">
                            {new Date(siteDate.startTime).toLocaleTimeString(
                              "ja-JP",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(siteDate.endTime).toLocaleTimeString(
                              "ja-JP",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        )}
                        {/* スタッフ情報を表示 */}
                        {siteDate.siteDateEmployees &&
                          siteDate.siteDateEmployees.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-slate-500 mb-1">
                                派遣スタッフ:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {siteDate.siteDateEmployees.map(
                                  (siteDateEmployee) => (
                                    <span
                                      key={siteDateEmployee.id}
                                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                    >
                                      {siteDateEmployee.employee.name}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                      <div className="ml-4">
                        <Link
                          href={`/sites/${site.id}/date/${siteDate.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                          編集
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">現場日が設定されていません</p>
              )}
            </CardContent>
          </Card>

          {/* その他情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                その他情報
              </CardTitle>
              <CardDescription>追加情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {site.googleMapLink && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Googleマップリンク
                  </label>
                  <a
                    href={site.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    {site.googleMapLink}
                  </a>
                </div>
              )}
              {site.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    備考
                  </label>
                  <p className="text-slate-900 whitespace-pre-wrap">
                    {site.notes}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    作成日
                  </label>
                  <p className="text-slate-900">
                    {new Date(site.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    更新日
                  </label>
                  <p className="text-slate-900">
                    {new Date(site.updatedAt).toLocaleDateString("ja-JP")}
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
