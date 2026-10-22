import type { Contact } from "../types/contact";
import { ContactCard } from "./ContactCard";

interface Props {
  contacts: Contact[];
  selectedId: string | null;
  onOpen: (id: string) => void;
}

/**
 * Phone version of the Table view. A 1,100px-wide spreadsheet is awkward to use
 * on a 360px screen, so each row becomes a compact card. The same contacts are
 * shown, and the remaining fields are in the details panel.
 */
export function ContactsList({ contacts, selectedId, onOpen }: Props) {
  if (contacts.length === 0) {
    return (
      <p className="p-10 text-center text-sm text-zinc-600">
        No contacts match your search.
      </p>
    );
  }
  return (
    <ul aria-label="Contacts" className="flex flex-col gap-2 p-3">
      {contacts.map((c) => (
        <li key={c.id}>
          <ContactCard
            contact={c}
            selected={c.id === selectedId}
            onOpen={onOpen}
            showStage
          />
        </li>
      ))}
    </ul>
  );
}
