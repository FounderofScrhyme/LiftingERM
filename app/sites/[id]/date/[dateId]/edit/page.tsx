import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SiteDateForm from "@/components/forms/SiteDateForm";

interface SiteDateEditPageProps {
  params: {
    id: string;
    dateId: string;
  };
}

export default async function SiteDateEditPage({
  params,
}: SiteDateEditPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const siteDate = await prisma.siteDate.findFirst({
    where: {
      id: params.dateId,
      site: {
        id: params.id,
        userId: user.id,
      },
    },
    include: {
      site: true,
      siteDateEmployees: {
        include: {
          employee: true,
        },
      },
    },
  });

  if (!siteDate) {
    redirect("/sites");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SiteDateForm siteDate={siteDate} mode="edit" />
    </div>
  );
}
