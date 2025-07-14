import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientForm from "@/components/forms/ClientForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface EditClientPageProps {
  params: {
    id: string;
  };
}

export default async function EditClientPage({ params }: EditClientPageProps) {
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

  // クライアントを取得
  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      registrarId: user.id,
    },
  });

  if (!client) {
    redirect("/clients");
  }

  // フォーム用のデータを変換
  const formData = {
    id: client.id,
    company_name: client.companyName,
    phone: client.phone,
    address: client.address,
    postal_code: client.postalCode,
    contact_person: client.contactPerson,
    contact_phone: client.contactPhone,
    contact_email: client.contactEmail || "",
    notes: client.notes || "",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ClientForm client={formData} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
