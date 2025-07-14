import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SalesList from "@/components/tables/SalesList";

export default function SalesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <SalesList />
      </div>
    </DashboardLayout>
  );
}
