import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SiteForm from "@/components/forms/SiteForm";

interface EditSitePageProps {
  params: {
    id: string;
  };
}

export default async function EditSitePage({ params }: EditSitePageProps) {
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

  // フォーム用のデータを変換
  const formData = {
    id: site.id,
    name: site.name,
    client: site.client,
    contactPerson: site.contactPerson,
    contactPhone: site.contactPhone,
    postalCode: site.postalCode || "",
    address: site.address,
    googleMapLink: site.googleMapLink || "",
    employeeNames: site.employeeNames || "",
    employeeData: site.employeeData || null,
    siteDates: site.siteDates || [],
    notes: site.notes || "",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">現場情報編集</h1>
          <p className="text-slate-600 mt-2">現場の情報を編集してください</p>
        </div>
        <SiteForm site={formData} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
