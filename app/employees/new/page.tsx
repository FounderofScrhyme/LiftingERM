import EmployeeForm from "@/components/forms/EmployeeForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function NewEmployeePage() {
  return (
    <DashboardLayout>
      <div className="p-4 bg-slate-100 min-h-screen">
        <EmployeeForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
