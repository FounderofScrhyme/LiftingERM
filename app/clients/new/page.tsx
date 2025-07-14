import ClientForm from "@/components/forms/ClientForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function NewClientPage() {
  return (
    <DashboardLayout>
      <div className="p-4 bg-slate-100 min-h-screen">
        <ClientForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
