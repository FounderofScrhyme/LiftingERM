import SalesForm from "@/components/forms/SalesForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function NewSalesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <SalesForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
