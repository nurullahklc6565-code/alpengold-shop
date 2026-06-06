import { prisma } from "@/lib/prisma";

function parseValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  return String(raw).replace(/^"|"$/g, "");
}

/** Birden fazla setting'i tek sorguda çeker; eksikler boş string döner */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const key of keys) map[key] = "";
  for (const row of rows) map[row.key] = parseValue(row.value);
  return map;
}

/** Tek bir setting değeri döner */
export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  return parseValue(row.value) || fallback;
}
