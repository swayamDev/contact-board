import { Plus } from "@phosphor-icons/react";
import { STAGES, type Contact } from "../types/contact";
import { ContactCard } from "./ContactCard";
import { STAGE_STYLES } from "../data/stageStyles";

interface Props {
  contacts: Contact[];
  selectedId: string | null;
  onOpen: (id: string) => void;
}

export function ContactsBoard({ contacts, selectedId, onOpen }: Props) {
  return (
    <div className="flex h-full min-w-[960px] gap-4 p-6">
      {STAGES.map((stage) => {
        // Derived from the shared list. No separate board state.
        const items = contacts.filter((c) => c.stage === stage);
        return (
          <section
            key={stage}
            aria-labelledby={`col-${stage}`}
            className="flex min-w-0 flex-1 flex-col rounded-xl bg-zinc-50 p-2"
          >
            <h2
              id={`col-${stage}`}
              className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-zinc-800"
            >
              <span
                aria-hidden
                className={`size-2 rounded-full ${STAGE_STYLES[stage].dot}`}
              />
              {stage}
              <span className="text-xs font-normal text-zinc-500">
                <span className="sr-only">, </span>
                {items.length}
              </span>
            </h2>
            {items.length === 0 ? (
              <div className="mt-1 flex flex-col items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-8 text-center">
                <Plus size={16} aria-hidden className="text-zinc-400" />
                <p className="text-sm text-zinc-500">No contacts yet</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2 overflow-y-auto">
                {items.map((c) => (
                  <li key={c.id}>
                    <ContactCard
                      contact={c}
                      selected={c.id === selectedId}
                      onOpen={onOpen}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
