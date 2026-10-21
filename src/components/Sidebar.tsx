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
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                  current
                    ? "bg-zinc-200/60 font-medium text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Icon
                  size={16}
                  weight={current ? "fill" : "regular"}
                  aria-hidden
                />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
