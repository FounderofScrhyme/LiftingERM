import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SalesList from "@/components/tables/SalesList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SalesPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">売上管理</h2>
            <p className="text-slate-500 text-sm mt-2">
              取引先別売上一覧を管理・作成できます。
            </p>
          </div>
          <Link href="/sales/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規売上登録
            </Button>
          </Link>
        </div>
        <SalesList />
      </div>
    </DashboardLayout>
  );
}
