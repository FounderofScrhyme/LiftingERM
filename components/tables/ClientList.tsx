"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TableLoader } from "../ui/loader";
import { ArrowLeft, ArrowRight, Edit, Edit2, Trash2 } from "lucide-react";

interface Client {
  id: string;
  companyName: string;
  phone: string;
  address: string;
  postalCode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string | null;
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

interface ClientListResponse {
  clients: Client[];
  pagination: Pagination;
}

export default function ClientList() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // クライアント一覧を取得
  const fetchClients = async (page: number = 1, searchTerm: string = "") => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get<ClientListResponse>(
        `/api/clients?${params}`
      );

      setClients(response.data.clients);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Failed to fetch clients:", error);
      setError(error.response?.data?.error || "取引先の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchClients();
  }, []);

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1, search);
  };

  // ページ変更
  const handlePageChange = (newPage: number) => {
    fetchClients(newPage, search);
  };

  // クライアント削除
  const handleDelete = async (clientId: string) => {
    if (!confirm("この取引先を削除しますか？")) {
      return;
    }

    try {
      await axios.delete(`/api/clients/${clientId}`);
      // 削除後に一覧を再取得
      fetchClients(pagination.page, search);
    } catch (error: any) {
      alert(error.response?.data?.error || "削除に失敗しました");
    }
  };

  if (error) {
    return (
      <Card className="max-w-6xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => fetchClients()} className="mt-4">
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
            <CardTitle>取引先一覧</CardTitle>
            <CardDescription className="pt-2">
              登録されている取引先の一覧です
            </CardDescription>
          </div>
          {/* <Button onClick={() => router.push("/clients/new")}>新規登録</Button> */}
        </div>
      </CardHeader>
      <CardContent>
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="会社名または担当者名で検索"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isLoading}>
                検索
              </Button>
            </div>
          </div>
        </form>

        {/* ローディング表示 */}
        {isLoading && <TableLoader />}

        {/* クライアント一覧 */}
        {!isLoading && clients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">取引先が登録されていません</p>
            <Button
              onClick={() => router.push("/clients/new")}
              className="mt-4"
            >
              最初の取引先を登録
            </Button>
          </div>
        )}

        {!isLoading && clients.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">会社名</th>
                    <th className="text-left p-4 font-medium">担当者</th>
                    <th className="text-left p-4 font-medium">電話番号</th>
                    <th className="text-left p-4 font-medium">住所</th>
                    <th className="text-left p-4 font-medium">登録日</th>
                    <th className="text-left p-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {client.companyName}
                          </div>
                          {client.contactEmail && (
                            <div className="text-sm text-slate-500">
                              {client.contactEmail}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div>{client.contactPerson}</div>
                          {client.contactPhone && (
                            <div className="text-sm text-slate-500">
                              {client.contactPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{client.phone}</td>
                      <td className="p-4">
                        <div>
                          <div>{client.postalCode}</div>
                          <div className="text-sm text-slate-500">
                            {client.address}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {new Date(client.createdAt).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/clients/${client.id}`)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ArrowRight />
                            詳細
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/clients/${client.id}/edit`)
                            }
                            className="text-green-500 hover:text-green-700"
                          >
                            <Edit2 />
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(client.id)}
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
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  前へ
                </Button>

                <span className="text-sm">
                  {pagination.page} / {pagination.totalPages} ページ (
                  {pagination.total}件中{" "}
                  {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                  件)
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  次へ
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
