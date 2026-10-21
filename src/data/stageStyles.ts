import type { Stage } from "../types/contact";

export const STAGE_STYLES: Record<Stage, { badge: string; dot: string }> = {
  Lead: { badge: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  Prospect: { badge: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  Qualified: { badge: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  Customer: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};
