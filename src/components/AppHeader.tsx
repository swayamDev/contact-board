import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { ViewSwitcher, type View } from "./ViewSwitcher";

interface Props {
  shown: number;
  total: number;
  view: View;
  onViewChange: (v: View) => void;
  query: string;
  onQueryChange: (q: string) => void;
  onAdd: () => void;
}

export function AppHeader({
  shown,
  total,
  view,
  onViewChange,
  query,
  onQueryChange,
  onAdd,
}: Props) {
  return (
    <header className="flex h-[67px] shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4">
      <div className="flex shrink-0 items-baseline gap-2">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          Contacts
        </h1>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {shown === total ? total : `${shown} of ${total}`}
        </span>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-3">
        <label className="relative max-w-56 min-w-28 flex-1">
          <span className="sr-only">Search contacts</span>
          <MagnifyingGlass
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search contacts"
            className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600"
          />
        </label>
        <ViewSwitcher view={view} onChange={onViewChange} />
        <button
          type="button"
          data-add-contact
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
        >
          <Plus size={16} weight="bold" aria-hidden />
          Add contact
        </button>
      </div>
    </header>
  );
}
