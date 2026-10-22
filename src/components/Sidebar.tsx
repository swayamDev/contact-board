import {
  AddressBook,
  Buildings,
  Gear,
  SquaresFour,
} from "@phosphor-icons/react";

const NAV = [
  { label: "Overview", Icon: SquaresFour, current: false },
  { label: "Contacts", Icon: AddressBook, current: true },
  { label: "Companies", Icon: Buildings, current: false },
  { label: "Settings", Icon: Gear, current: false },
];

export function Sidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col gap-4 border-r border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-center gap-2 px-2 pt-1">
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white"
        >
          C
        </span>
        <span className="text-sm font-semibold text-zinc-900">
          Contact Board
        </span>
      </div>
      <nav aria-label="Primary">
        <ul className="flex flex-col gap-0.5">
          {NAV.map(({ label, Icon, current }) => (
            <li key={label}>
              {current ? (
                <a
                  href="#contacts"
                  onClick={(e) => e.preventDefault()}
                  aria-current="page"
                  className="flex items-center gap-2 rounded-md bg-zinc-200/60 px-2 py-1.5 text-sm font-medium text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <Icon size={16} weight="fill" aria-hidden />
                  {label}
                </a>
              ) : (
                // Placeholder destinations: not interactive, so not tab stops.
                <button
                  type="button"
                  disabled
                  title="Not part of this prototype"
                  className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-500"
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
