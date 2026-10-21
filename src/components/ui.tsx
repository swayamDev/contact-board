import type { ReactNode } from "react";
import { STAGE_STYLES } from "../data/stageStyles";
import type { Stage } from "../types/contact";

export function StageBadge({ stage }: { stage: Stage }) {
  const s = STAGE_STYLES[stage];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${s.dot}`} />
      {stage}
    </span>
  );
}

export function Avatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const dims = size === "lg" ? "size-10 text-sm" : "size-6 text-[10px]";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-600 ${dims}`}
    >
      {initials}
    </span>
  );
}

export function LabelTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-xs whitespace-nowrap text-zinc-600">
      {children}
    </span>
  );
}

/** Renders a value, or a subtle em dash when it is missing/blank. */
export function Value({ children }: { children?: string | null }) {
  const text = children?.trim();
  if (!text) {
    return (
      <span className="text-zinc-300" aria-label="Not set">
        —
      </span>
    );
  }
  return <>{text}</>;
}

export function Labels({
  labels,
  nowrap = false,
}: {
  labels: string[];
  nowrap?: boolean;
}) {
  if (labels.length === 0) return <Value />;
  return (
    <span className={`flex gap-1 ${nowrap ? "flex-nowrap" : "flex-wrap"}`}>
      {labels.map((l) => (
        <LabelTag key={l}>{l}</LabelTag>
      ))}
    </span>
  );
}
