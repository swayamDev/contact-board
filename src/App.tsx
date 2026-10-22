import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { ContactDetailsPanel } from "./components/ContactDetailsPanel";
import { ContactsBoard } from "./components/ContactsBoard";
import { ContactsList } from "./components/ContactsList";
import { ContactsTable } from "./components/ContactsTable";
import { NewContactPanel } from "./components/NewContactPanel";
import { Sidebar } from "./components/Sidebar";
import type { View } from "./components/ViewSwitcher";
import { initialContacts } from "./data/contacts";
import { useMediaQuery } from "./hooks/useMediaQuery";
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

  // Same breakpoints as Tailwind: md = 48rem, xl = 80rem.
  const phone = useMediaQuery("(width < 48rem)"); // Table view becomes a card list
  const drawer = useMediaQuery("(width < 80rem)"); // details panel becomes a modal drawer

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

  // Close whichever panel is open without saving (Escape, backdrop click).
  const panelOpen = selectedId !== null || creating;
  const dismissPanel = useCallback(() => {
    if (creating) {
      returnFocusId.current = "add";
      setCreating(false);
    } else {
      returnFocusId.current = selectedId;
      setSelectedId(null);
    }
  }, [creating, selectedId]);

  // Escape works wherever focus is. (Beside the content the panel is non-modal,
  // so focus may be back in the table or board.)
  useEffect(() => {
    if (!panelOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) dismissPanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, dismissPanel]);

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
    <div className="flex h-dvh bg-white text-zinc-900">
      {/* While the drawer is open, the page behind it is inert (unfocusable, unclickable). */}
      <Sidebar inert={drawer && panelOpen} />
      <div className="relative flex min-w-0 flex-1">
        <main
          inert={drawer && panelOpen}
          className="flex min-w-0 flex-1 flex-col"
        >
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
              phone ? (
                <ContactsList
                  contacts={visible}
                  selectedId={selectedId}
                  onOpen={openContact}
                />
              ) : (
                <ContactsTable
                  contacts={visible}
                  selectedId={selectedId}
                  onOpen={openContact}
                />
              )
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
        {drawer && panelOpen && (
          <div
            aria-hidden
            onClick={dismissPanel}
            className="fixed inset-0 z-20 bg-zinc-900/30"
          />
        )}
        {creating && (
          <NewContactPanel
            onCreate={createContact}
            onClose={dismissPanel}
            modal={drawer}
          />
        )}
        {selected && (
          <ContactDetailsPanel
            key={selected.id}
            contact={selected}
            onSave={saveContact}
            onDelete={deleteContact}
            onClose={closePanel}
            modal={drawer}
          />
        )}
      </div>
    </div>
  );
}

export default App;
