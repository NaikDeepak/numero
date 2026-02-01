import { z } from "zod";

export const GenderSchema = z.enum(["Male", "Female", "Other"]);
export type Gender = z.infer<typeof GenderSchema>;

export const NumerologyInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  gender: GenderSchema,
});
export type NumerologyInput = z.infer<typeof NumerologyInputSchema>;

export const NumerologyResultSchema = z.object({
  moolank: z.number().min(1).max(9),
  bhagyank: z.number().min(1).max(9),
  kua: z.union([z.number().min(1).max(9), z.string()]),
  gridNumbers: z.array(z.number()),
});
export type NumerologyResult = z.infer<typeof NumerologyResultSchema>;

export const NameNumbersSchema = z.object({
  destinyNumber: z.number(),
  soulUrgeNumber: z.number(),
  personalityNumber: z.number(),
});
export type NameNumbers = z.infer<typeof NameNumbersSchema>;
