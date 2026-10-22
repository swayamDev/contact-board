import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "@phosphor-icons/react";
import { STAGE_STYLES } from "../data/stageStyles";
import { getDropStage } from "../lib/board";
import { STAGES, type Contact, type Stage } from "../types/contact";
import { ContactCard } from "./ContactCard";

interface Props {
  contacts: Contact[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onMove: (id: string, stage: Stage) => void;
}

function DraggableItem({
  contact,
  selected,
  onOpen,
}: {
  contact: Contact;
  selected: boolean;
  onOpen: (id: string) => void;
}) {
  // Pointer-only dragging: the card stays a plain button, so Enter/Space still
  // open it. Keyboard users change stage with the Stage select in the panel.
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: contact.id,
  });
  return (
    <li
      ref={setNodeRef}
      {...listeners}
      style={{ touchAction: "manipulation" }}
      className={isDragging ? "opacity-40" : undefined}
    >
      <ContactCard contact={contact} selected={selected} onOpen={onOpen} />
    </li>
  );
}

function BoardColumn({
  stage,
  items,
  dragging,
  selectedId,
  onOpen,
}: {
  stage: Stage;
  items: Contact[];
  dragging: boolean;
  selectedId: string | null;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`col-${stage}`}
      className={`flex w-[80vw] max-w-72 shrink-0 flex-col rounded-xl p-2 transition-colors md:w-auto md:max-w-none md:min-w-0 md:flex-1 xl:max-w-[24rem] ${
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
        <span className="text-xs font-normal text-zinc-600">
          <span className="sr-only">, </span>
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <div className="mt-1 flex flex-col items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-8 text-center">
          <Plus size={16} aria-hidden className="text-zinc-500" />
          <p className="text-sm text-zinc-600">No contacts yet</p>
          {dragging && (
            <p className="text-xs text-zinc-500">Drop a card here</p>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {items.map((c) => (
            <DraggableItem
              key={c.id}
              contact={c}
              selected={c.id === selectedId}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export function ContactsBoard({ contacts, selectedId, onOpen, onMove }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    // A few pixels of movement before a drag starts keeps plain clicks working.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Long-press to drag on touch, so swiping still scrolls the board.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  const nameOf = (id: string | number) =>
    contacts.find((c) => c.id === id)?.name ?? "Contact";
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} is over ${over.id}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${nameOf(active.id)} dropped in ${over.id}.`
        : `${nameOf(active.id)} was dropped outside a column.`,
    onDragCancel: ({ active }) => `Move of ${nameOf(active.id)} cancelled.`,
  };

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const stage = getDropStage(contacts, id, e.over?.id);
    if (stage) onMove(id, stage);
    setActiveId(null);
  }

  const active = contacts.find((c) => c.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Drag with a mouse, or press and hold on a touch screen. To use the keyboard, open the contact and change its stage.",
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex h-full w-max min-w-full gap-3 p-4 md:w-auto md:min-w-[960px] md:gap-4 md:p-6">
        {STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            stage={stage}
            // Derived from the shared list. No separate board state.
            items={contacts.filter((c) => c.stage === stage)}
            dragging={activeId !== null}
            selectedId={selectedId}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {active ? <ContactCard contact={active} preview /> : null}
      </DragOverlay>
    </DndContext>
  );
}
