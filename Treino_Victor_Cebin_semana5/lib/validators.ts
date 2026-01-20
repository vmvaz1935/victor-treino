import { z } from "zod";

export const daySchema = z.enum(["SEG", "QUA", "SEX"]);
export const sessionCodeSchema = z.enum(["A", "B", "C", "D", "DELOAD"]);

export const intFromString = z.preprocess((v) => {
  if (typeof v === "string" && v.trim() !== "") return Number.parseInt(v, 10);
  return v;
}, z.number().int());

export const optionalString = z
  .string()
  .transform((s) => s.trim())
  .refine(() => true)
  .optional();

export const numberFromStringOptional = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  if (typeof v === "string") return Number(v.replace(",", "."));
  return v;
}, z.number().finite().optional());


