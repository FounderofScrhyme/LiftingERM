import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SiteForm from "@/components/forms/SiteForm";

export default async function NewSitePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
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
        <SiteForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
