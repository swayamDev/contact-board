import type { Contact } from "../types/contact";
import { Avatar, Labels, Value } from "./ui";

interface Props {
  contact: Contact;
  selected: boolean;
  onOpen: (id: string) => void;
}

export function ContactCard({ contact, selected, onOpen }: Props) {
  return (
    <button
      type="button"
      data-contact-id={contact.id}
      onClick={() => onOpen(contact.id)}
      className={`flex w-full flex-col gap-2 rounded-lg border bg-white p-3 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
        selected ? "border-indigo-400" : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <span className="flex items-center gap-2">
        <Avatar name={contact.name} />
        <span className="truncate text-sm font-medium text-zinc-900">
          {contact.name}
        </span>
      </span>
      <span className="text-xs text-zinc-500">
        <Value>{contact.role}</Value> · <Value>{contact.company}</Value>
      </span>
      <Labels labels={contact.labels} />
    </button>
  );
}
