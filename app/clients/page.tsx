import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ClientList from "@/components/tables/ClientList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ClientsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 bg-slate-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">取引先管理</h2>
            <p className="text-slate-500 text-sm mt-2">
              取引先の一覧を確認・管理できます。
            </p>
          </div>
          <Link href="/clients/new">
            <Button className="bg-blue-500">新規取引先登録</Button>
          </Link>
        </div>

        <ClientList />
      </div>
    </DashboardLayout>
  );
}
