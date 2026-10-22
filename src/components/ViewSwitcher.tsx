import { Columns, Table } from "@phosphor-icons/react";

export type View = "table" | "board";

const OPTIONS = [
  { value: "table", label: "Table", Icon: Table },
  { value: "board", label: "Board", Icon: Columns },
] as const;

export function ViewSwitcher({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Switch view"
      className="inline-flex shrink-0 rounded-lg bg-zinc-100 p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
              active
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Icon size={16} weight={active ? "bold" : "regular"} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
