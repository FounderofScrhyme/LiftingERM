import { z } from "zod";

export const siteSchema = z.object({
  name: z.string().min(1, "現場名は必須です"),
  client: z.string().min(1, "取引先は必須です"),
  contactPerson: z.string().min(1, "担当者名は必須です"),
  contactPhone: z.string().min(1, "担当者電話番号は必須です"),
  postalCode: z
    .string()
    .regex(/^\d{3}-\d{4}$/, "郵便番号の形式が正しくありません")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "住所は必須です"),
  googleMapLink: z
    .string()
    .url("GoogleマップのURLの形式が正しくありません")
    .optional()
    .or(z.literal("")),
  employeeNames: z.string().optional(),
  notes: z.string().optional(),
});

export type SiteInput = z.infer<typeof siteSchema>;
