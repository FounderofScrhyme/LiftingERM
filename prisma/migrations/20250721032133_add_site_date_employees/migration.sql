-- CreateTable
CREATE TABLE "site_date_employees" (
    "id" TEXT NOT NULL,
    "siteDateId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "unitPay" INTEGER,
    "hourlyOvertimePay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "site_date_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_date_employees_siteDateId_employeeId_key" ON "site_date_employees"("siteDateId", "employeeId");

-- AddForeignKey
ALTER TABLE "site_date_employees" ADD CONSTRAINT "site_date_employees_siteDateId_fkey" FOREIGN KEY ("siteDateId") REFERENCES "site_dates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_date_employees" ADD CONSTRAINT "site_date_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_date_employees" ADD CONSTRAINT "site_date_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
