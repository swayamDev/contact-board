import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { STAGE_STYLES } from "../data/stageStyles";
import { STAGES, type Contact, type Stage } from "../types/contact";
import { ContactCard } from "./ContactCard";

interface Props {
  contacts: Contact[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onMove: (id: string, stage: Stage) => void;
}

export function ContactsBoard({ contacts, selectedId, onOpen, onMove }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  function endDrag() {
    setDraggingId(null);
    setOverStage(null);
  }

  return (
    <div className="flex h-full min-w-[960px] gap-4 p-6">
      {STAGES.map((stage) => {
        // Derived from the shared list. No separate board state.
        const items = contacts.filter((c) => c.stage === stage);
        const isOver = overStage === stage && draggingId !== null;
        return (
          <section
            key={stage}
            aria-labelledby={`col-${stage}`}
            onDragOver={(e) => {
              if (draggingId === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverStage(stage);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                setOverStage(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain") || draggingId;
              const moved = contacts.find((c) => c.id === id);
              if (id && moved && moved.stage !== stage) onMove(id, stage);
              endDrag();
            }}
            className={`flex min-w-0 flex-1 flex-col rounded-xl p-2 transition-colors ${
              isOver ? "bg-indigo-50 ring-2 ring-indigo-300" : "bg-zinc-50"
            }`}
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
                {draggingId && (
                  <p className="text-xs text-zinc-400">Drop a card here</p>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-2 overflow-y-auto">
                {items.map((c) => (
                  <li
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", c.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(c.id);
                    }}
                    onDragEnd={endDrag}
                    className={draggingId === c.id ? "opacity-40" : undefined}
                  >
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
