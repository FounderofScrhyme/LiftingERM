import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SiteForm from "@/components/forms/SiteForm";
import { cookies } from "next/headers";
import { parse } from "date-fns";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // クエリパラメータからdateを取得
  let initialDate: Date | null = null;
  if (searchParams?.date) {
    initialDate = parse(searchParams.date, "yyyy-MM-dd", new Date());
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">新規現場登録</h1>
          <p className="text-slate-600 mt-2">
            新しい現場の情報を入力してください
          </p>
        </div>
        <SiteForm mode="create" initialDate={initialDate} />
      </div>
    </DashboardLayout>
  );
}
