import type { Contact } from "../types/contact";
import { Avatar, Labels, StageBadge, Value } from "./ui";

interface Props {
  contacts: Contact[];
  selectedId: string | null;
  onOpen: (id: string) => void;
}

const COLUMNS = [
  "Name",
  "Company",
  "Email",
  "Role",
  "Owner",
  "Labels",
  "Stage",
  "Notes",
];

export function ContactsTable({ contacts, selectedId, onOpen }: Props) {
  if (contacts.length === 0) {
    return (
      <p className="p-10 text-center text-sm text-zinc-500">
        No contacts match your search.
      </p>
    );
  }
  return (
    <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
      <thead className="sticky top-0 z-10 bg-white">
        <tr className="border-b border-zinc-200">
          {COLUMNS.map((c) => (
            <th
              key={c}
              scope="col"
              className="px-3 py-2 text-xs font-medium whitespace-nowrap text-zinc-600 first:pl-6"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {contacts.map((c) => {
          const selected = c.id === selectedId;
          return (
            <tr
              key={c.id}
              // Mouse convenience: the whole row is clickable. The name button
              // below is the keyboard/screen-reader target, and its click bubbles
              // up to this single handler.
              onClick={() => onOpen(c.id)}
              className={`cursor-pointer border-b border-zinc-100 ${
                selected
                  ? "bg-indigo-50/60"
                  : "focus-within:bg-zinc-50 hover:bg-zinc-50"
              }`}
            >
              <td className="px-3 py-2 pl-6 whitespace-nowrap">
                <button
                  type="button"
                  data-contact-id={c.id}
                  aria-haspopup="dialog"
                  aria-expanded={selected}
                  className="flex items-center gap-2 rounded-sm font-medium text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Avatar name={c.name} />
                  {c.name}
                </button>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-zinc-700">
                <Value>{c.company}</Value>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-zinc-600">
                <Value>{c.email}</Value>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-zinc-600">
                <Value>{c.role}</Value>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-zinc-600">
                <Value>{c.owner}</Value>
              </td>
              <td className="px-3 py-2">
                <Labels labels={c.labels} nowrap />
              </td>
              <td className="px-3 py-2">
                <StageBadge stage={c.stage} />
              </td>
              <td
                className="max-w-[260px] truncate px-3 py-2 text-zinc-500"
                title={c.notes || undefined}
              >
                <Value>{c.notes}</Value>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
