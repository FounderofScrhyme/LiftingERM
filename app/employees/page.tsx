import { DashboardLayout } from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/tables/EmployeeList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function EmployeesPage() {
  return (
    <DashboardLayout>
      <div className="p-4 bg-slate-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">スタッフ管理</h2>
            <p className="text-slate-500 text-sm mt-2">
              スタッフの一覧を管理・作成できます。
            </p>
          </div>
          <Link href="/employees/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規スタッフ登録
            </Button>
          </Link>
        </div>

        <EmployeeList />
      </div>
    </DashboardLayout>
  );
}
