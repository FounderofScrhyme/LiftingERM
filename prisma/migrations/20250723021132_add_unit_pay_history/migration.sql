-- CreateTable
CREATE TABLE "unit_pay_history" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "unitPay" INTEGER NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_pay_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unit_pay_history" ADD CONSTRAINT "unit_pay_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
