import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { ContactDetailsPanel } from "./components/ContactDetailsPanel";
import { ContactsBoard } from "./components/ContactsBoard";
import { ContactsTable } from "./components/ContactsTable";
import { NewContactPanel } from "./components/NewContactPanel";
import { Sidebar } from "./components/Sidebar";
import type { View } from "./components/ViewSwitcher";
import { initialContacts } from "./data/contacts";
import { loadContacts, saveContacts } from "./lib/storage";
import type { Contact, ContactDraft, Stage } from "./types/contact";

function App() {
  // Single source of truth. Table and Board both read from this list.
  // Initialised from localStorage (if valid), otherwise from the sample data.
  const [contacts, setContacts] = useState<Contact[]>(() =>
    loadContacts(initialContacts),
  );
  const [view, setView] = useState<View>("table");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const returnFocusId = useRef<string | null>(null);

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

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
    setCreating(false);
    setSelectedId(id);
  }

  function closePanel() {
    returnFocusId.current = selectedId;
    setSelectedId(null);
    setCreating(false);
  }

  function saveContact(id: string, draft: ContactDraft) {
    setContacts((current) =>
      current.map((c) =>
        c.id === id ? { ...c, stage: draft.stage, notes: draft.notes } : c,
      ),
    );
    closePanel();
  }

  function moveContact(id: string, stage: Stage) {
    setContacts((current) =>
      current.map((c) => (c.id === id ? { ...c, stage } : c)),
    );
  }

  function createContact(contact: Contact) {
    setContacts((current) => [contact, ...current]);
    setCreating(false);
    setSelectedId(null);
    returnFocusId.current = contact.id;
  }

  function deleteContact(id: string) {
    setContacts((current) => current.filter((c) => c.id !== id));
    setSelectedId(null);
    returnFocusId.current = "add";
  }

  function startCreating() {
    setSelectedId(null);
    setCreating(true);
  }

  // Escape closes whichever panel is open, without saving, wherever focus is.
  // (The panel is non-modal, so focus may be back in the table or board.)
  const panelOpen = selectedId !== null || creating;
  useEffect(() => {
    if (!panelOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (creating) {
        returnFocusId.current = "add";
        setCreating(false);
      } else {
        returnFocusId.current = selectedId;
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, creating, selectedId]);

  // After a panel closes, return focus to the row/card that opened it
  // (or to the Add contact button when there is no row left to focus).
  useEffect(() => {
    if (selectedId === null && !creating && returnFocusId.current) {
      const target = returnFocusId.current;
      const selector =
        target === "add"
          ? "[data-add-contact]"
          : `[data-contact-id="${target}"]`;
      returnFocusId.current = null;
      document.querySelector<HTMLElement>(selector)?.focus();
    }
  }, [selectedId, creating, view, contacts]);

  return (
    <div className="flex h-screen bg-white text-zinc-900">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            shown={visible.length}
            total={contacts.length}
            view={view}
            onViewChange={setView}
            query={query}
            onQueryChange={setQuery}
            onAdd={startCreating}
          />
          <div className="relative min-h-0 flex-1 overflow-auto">
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
                onMove={moveContact}
              />
            )}
          </div>
        </main>
        {creating && (
          <NewContactPanel
            onCreate={createContact}
            onClose={() => {
              returnFocusId.current = "add";
              setCreating(false);
            }}
          />
        )}
        {selected && (
          <ContactDetailsPanel
            key={selected.id}
            contact={selected}
            onSave={saveContact}
            onDelete={deleteContact}
            onClose={closePanel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
