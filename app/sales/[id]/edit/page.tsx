import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SalesForm from "@/components/forms/SalesForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface EditSalesPageProps {
  params: {
    id: string;
  };
}

export default async function EditSalesPage({ params }: EditSalesPageProps) {
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

  // フォーム用のデータを変換
  const formData = {
    id: sales.id,
    clientId: sales.clientId,
    amount: sales.amount,
    date: sales.date.toISOString().split("T")[0],
    notes: sales.notes || "",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <SalesForm sales={formData} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
