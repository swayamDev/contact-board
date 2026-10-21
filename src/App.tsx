import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { ContactDetailsPanel } from "./components/ContactDetailsPanel";
import { ContactsBoard } from "./components/ContactsBoard";
import { ContactsTable } from "./components/ContactsTable";
import { Sidebar } from "./components/Sidebar";
import type { View } from "./components/ViewSwitcher";
import { initialContacts } from "./data/contacts";
import type { Contact, ContactDraft } from "./types/contact";

function App() {
  // Single source of truth. Table and Board both read from this list.
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [view, setView] = useState<View>("table");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const returnFocusId = useRef<string | null>(null);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.email, c.company, c.role, c.owner, ...c.labels].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [contacts, query]);

  function openContact(id: string) {
    setSelectedId(id);
  }

  function closePanel() {
    returnFocusId.current = selectedId;
    setSelectedId(null);
  }

  function saveContact(id: string, draft: ContactDraft) {
    setContacts((current) =>
      current.map((c) =>
        c.id === id ? { ...c, stage: draft.stage, notes: draft.notes } : c,
      ),
    );
    closePanel();
  }

  // After the panel closes, return focus to the row/card that opened it.
  useEffect(() => {
    if (selectedId === null && returnFocusId.current) {
      const el = document.querySelector<HTMLElement>(
        `[data-contact-id="${returnFocusId.current}"]`,
      );
      returnFocusId.current = null;
      el?.focus();
    }
  }, [selectedId, view, contacts]);

  return (
    <div className="flex h-screen bg-white text-zinc-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            shown={visible.length}
            total={contacts.length}
            view={view}
            onViewChange={setView}
            query={query}
            onQueryChange={setQuery}
          />
          <div className="min-h-0 flex-1 overflow-auto">
            {view === "table" ? (
              <ContactsTable
                contacts={visible}
                selectedId={selectedId}
                onOpen={openContact}
              />
            ) : (
              <ContactsBoard
                contacts={visible}
                selectedId={selectedId}
                onOpen={openContact}
              />
            )}
          </div>
        </main>
        {selected && (
          <ContactDetailsPanel
            key={selected.id}
            contact={selected}
            onSave={saveContact}
            onClose={closePanel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
