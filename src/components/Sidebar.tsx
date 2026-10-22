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

export function Sidebar({ inert }: { inert?: boolean }) {
  return (
    <aside
      inert={inert}
      className="hidden shrink-0 flex-col gap-4 border-r border-zinc-200 bg-zinc-50 p-3 md:flex md:w-16 md:p-2 lg:w-52 lg:p-3"
    >
      <div className="flex items-center gap-2 px-2 pt-1 md:justify-center lg:justify-start">
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white"
        >
          C
        </span>
        <span className="hidden text-sm font-semibold text-zinc-900 lg:inline">
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
                  className="flex items-center gap-2 rounded-md bg-zinc-200/60 px-2 py-1.5 text-sm font-medium text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600 md:justify-center lg:justify-start pointer-coarse:min-h-11"
                >
                  <Icon size={16} weight="fill" aria-hidden />
                  <span className="sr-only lg:not-sr-only">{label}</span>
                </a>
              ) : (
                // Placeholder destinations: not interactive, so not tab stops.
                <button
                  type="button"
                  disabled
                  title="Not part of this prototype"
                  className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-500 md:justify-center lg:justify-start"
                >
                  <Icon size={16} aria-hidden />
                  <span className="sr-only lg:not-sr-only">{label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
