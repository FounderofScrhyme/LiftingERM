import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  phone: z.string().min(1, { message: "電話番号は必須です" }),
  birthdate: z
    .string()
    .transform((str) => new Date(str))
    .refine(
      (date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 16;
      },
      { message: "16歳以上のスタッフを登録できます" }
    ),
  emergency_contact_person: z.string().optional(),
  emergency_contact_Phone: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  blood_type: z.string().optional(),
  blood_pressure: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // 120/80 のような形式をチェック
        const pattern = /^\d{2,3}\/\d{2,3}$/;
        return pattern.test(val);
      },
      { message: "血圧は「120/80」のような形式で入力してください" }
    )
    .transform((val) => {
      if (!val) return undefined;
      // 120/80 のような形式を数値に変換
      const parts = val.split("/");
      if (parts.length === 2) {
        const systolic = parseInt(parts[0]);
        const diastolic = parseInt(parts[1]);
        if (!isNaN(systolic) && !isNaN(diastolic)) {
          return `${systolic}/${diastolic}`;
        }
      }
      return undefined;
    }),
  unitpay: z.number().min(0, { message: "単価は必須です" }),
  hourlyovertimePay: z.number().min(0, { message: "残業一時間の額は必須です" }),
  notes: z.string().optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
