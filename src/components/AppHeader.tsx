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

// DOM order = visual order at every size: title, Add contact, search, view switch.
// Phones: row 1 is title + Add contact, row 2 is search + view switch.
// md and up: a single row with search and the switch pushed to the right.
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
    <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-zinc-200 px-4 py-3 md:flex md:px-6 md:py-4">
      <div className="flex min-w-0 items-center gap-2.5 md:shrink-0">
        <img
          src="/logo.png"
          alt=""
          className="size-6 shrink-0 rounded-md object-cover md:hidden"
        />
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          Contacts
        </h1>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-zinc-600">
          {shown === total ? total : `${shown} of ${total}`}
        </span>
      </div>
      <button
        type="button"
        data-add-contact
        onClick={onAdd}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
      >
        <Plus size={16} weight="bold" aria-hidden />
        <span className="max-[400px]:sr-only">Add contact</span>
      </button>
      <div className="col-span-2 flex items-center gap-3 md:contents">
        <label className="relative min-w-0 flex-1 md:ml-auto md:max-w-56 md:min-w-28">
          <span className="sr-only">Search contacts</span>
          <MagnifyingGlass
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-500"
          />
          {/* text-base on small screens stops iOS Safari zooming in on focus */}
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search contacts"
            className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8 text-base text-zinc-900 placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600 md:text-sm pointer-coarse:min-h-11"
          />
        </label>
        <ViewSwitcher view={view} onChange={onViewChange} />
      </div>
    </header>
  );
}
