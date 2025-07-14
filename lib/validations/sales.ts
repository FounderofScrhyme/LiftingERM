import { z } from "zod";

export const salesSchema = z.object({
  clientId: z.string().min(1, "取引先は必須です"),
  amount: z.number().min(1, "売上金額は必須です"),
  date: z.string().min(1, "売上日は必須です"),
  notes: z.string().optional(),
});

export type SalesInput = z.infer<typeof salesSchema>;
