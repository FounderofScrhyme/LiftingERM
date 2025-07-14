import { z } from "zod";

export const clientSchema = z.object({
  company_name: z.string().min(1, "会社名は必須です"),
  phone: z.string().min(1, "電話番号は必須です"),
  address: z.string().optional(),
  postal_code: z
    .string()
    .regex(/^\d{3}-\d{4}$/, "郵便番号の形式が正しくありません")
    .optional(),
  contact_person: z.string().min(1, "担当者名は必須です"),
  contact_phone: z.string().min(1, "担当者電話番号は必須です"),
  contact_email: z.string().email("メールアドレスの形式が不正です").optional(),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
