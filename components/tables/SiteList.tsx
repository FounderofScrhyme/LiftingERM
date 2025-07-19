"use client";

import { SiteDate, SiteEmployee } from "@/lib/generated/prisma";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TableLoader } from "../ui/loader";
import { Edit2, Trash2, Search, ArrowRight } from "lucide-react";

interface Site {
  id: string;
  name: string;
  postalCode: string | null;
  address: string;
  client: string;
  contactPerson: string;
  contactPhone: string;
  googleMapLink: string | null;
  employeeNames: string | null;
  siteDates: SiteDate[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SiteListResponse {
  sites: Site[];
  pagination: Pagination;
}

export default function SiteList() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async (
    page: number = 1,
    searchTerm: string = "",
    month: string = selectedMonth
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        month: month,
      });

      if (searchTerm) {
        params.set("search", searchTerm);
      }

      const response = await axios.get<SiteListResponse>(
        `/api/sites?${params.toString()}`
      );
      setSites(response.data.sites);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.log(
        "Error fetching sites:",
        error.response?.data || error.message
      );
      setError(error.response?.data?.message || "現場情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites(1, search, selectedMonth);
  }, [selectedMonth]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSites(1, search);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    fetchSites(1, search, newMonth);
  };

  const handlePageChange = (newPage: number) => {
    fetchSites(newPage, search);
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm("この現場を削除しますか？")) {
      return;
    }
    try {
      await axios.delete(`/api/sites/${siteId}`);
      fetchSites(pagination.page, search);
    } catch (error: any) {
      console.log(
        "Error deleting site:",
        error.response?.data || error.message
      );
      setError(error.response?.data?.message || "現場の削除に失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  if (error) {
    return (
      <Card className="max-w-6xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => fetchSites()} className="mt-4">
              再試行
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>現場一覧</CardTitle>
            <p className="pt-2 text-sm text-slate-500">
              現場の一覧を管理・作成できます。
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                月を選択
              </label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border border-slate-300 rounded-md px-3 py-2 w-48"
                disabled={isLoading}
              >
                {(() => {
                  const months = [];
                  const currentDate = new Date();
                  const currentYear = currentDate.getFullYear();

                  // 過去12ヶ月から未来6ヶ月まで
                  for (
                    let year = currentYear - 1;
                    year <= currentYear + 1;
                    year++
                  ) {
                    for (let month = 1; month <= 12; month++) {
                      const monthStr = `${year}-${String(month).padStart(
                        2,
                        "0"
                      )}`;
                      const monthLabel = `${year}年${month}月`;
                      months.push({ value: monthStr, label: monthLabel });
                    }
                  }
                  return months.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                現場名で検索
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="現場名を入力"
                className="border border-slate-300 rounded-md px-3 py-2 w-64"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="h-10">
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </form>

        {isLoading && <TableLoader />}

        {!isLoading && sites.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">現場が登録されていません</p>
            <Button onClick={() => router.push("/sites/new")} className="mt-4">
              最初の現場を登録
            </Button>
          </div>
        )}

        {!isLoading && sites.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-medium">現場名</th>
                    <th className="text-left p-4 font-medium">発注者名</th>
                    <th className="text-left p-4 font-medium">担当者名</th>
                    <th className="text-left p-4 font-medium">担当者連絡先</th>
                    <th className="text-left p-4 font-medium">派遣スタッフ</th>
                    <th className="text-left p-4 font-medium">現場日</th>
                    <th className="text-left p-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">{site.name}</td>
                      <td className="p-4">{site.client}</td>
                      <td className="p-4">{site.contactPerson}</td>
                      <td className="p-4">{site.contactPhone}</td>
                      <td className="p-4">
                        {site.employeeNames ? (
                          <div className="flex flex-wrap gap-1">
                            {site.employeeNames
                              .split(",")
                              .map((name, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                >
                                  {name.trim()}
                                </span>
                              ))}
                          </div>
                        ) : (
                          "未設定"
                        )}
                      </td>
                      <td className="p-4">
                        {site.siteDates.length > 0
                          ? site.siteDates
                              .map((date) => formatDate(date.date.toString()))
                              .join(", ")
                          : "未設定"}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/sites/${site.id}`)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ArrowRight />
                            詳細
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/sites/${site.id}/edit`)
                            }
                            className="text-green-500 hover:text-green-700"
                          >
                            <Edit2 />
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(site.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 />
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    前へ
                  </Button>
                  <span className="flex items-center px-4">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
