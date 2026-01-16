import type { SortDir } from "@/types/dashboard";

export function ariasort(
  dir: SortDir | null
): "ascending" | "descending" | "none" {
  if (!dir) return "none";
  return dir === "asc" ? "ascending" : "descending";
}
