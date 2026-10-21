import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, X } from "@phosphor-icons/react";
import {
  STAGES,
  type Contact,
  type ContactDraft,
  type Stage,
} from "../types/contact";
import { Avatar, Labels, Value } from "./ui";

interface Props {
  contact: Contact;
  onSave: (id: string, draft: ContactDraft) => void;
  onClose: () => void;
}

function ReadOnlyField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-900">{children}</dd>
    </div>
  );
}

export function ContactDetailsPanel({ contact, onSave, onClose }: Props) {
  // Draft lives here, so Cancel / close / Escape simply discard it.
  const [draft, setDraft] = useState<ContactDraft>({
    stage: contact.stage,
    notes: contact.notes ?? "",
  });
  const stageRef = useRef<HTMLSelectElement>(null);
  const stageId = useId();
  const notesId = useId();

  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  const dirty =
    draft.stage !== contact.stage || draft.notes !== (contact.notes ?? "");

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={`Details for ${contact.name}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      className="flex w-[400px] shrink-0 flex-col border-l border-zinc-200 bg-white"
    >
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={contact.name} size="lg" />
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {contact.name}
            </h2>
            <p className="text-sm text-zinc-500">
              <Value>{contact.role}</Value>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) onSave(contact.id, draft);
        }}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <ReadOnlyField label="Company">
              <Value>{contact.company}</Value>
            </ReadOnlyField>
            <ReadOnlyField label="Owner">
              <Value>{contact.owner}</Value>
            </ReadOnlyField>
            <div className="col-span-2">
              <ReadOnlyField label="Email">
                <Value>{contact.email}</Value>
              </ReadOnlyField>
            </div>
            <div className="col-span-2">
              <ReadOnlyField label="Labels">
                <Labels labels={contact.labels} />
              </ReadOnlyField>
            </div>
          </dl>

          <div className="border-t border-zinc-100 pt-5">
            <label
              htmlFor={stageId}
              className="text-xs font-medium text-zinc-500"
            >
              Stage
            </label>
            <div className="relative mt-1">
              <select
                id={stageId}
                ref={stageRef}
                value={draft.stage}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, stage: e.target.value as Stage }))
                }
                className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2 pr-8 pl-3 text-sm text-zinc-900 focus-visible:border-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600/30"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <CaretDown
                size={14}
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={notesId}
              className="text-xs font-medium text-zinc-500"
            >
              Notes
            </label>
            <textarea
              id={notesId}
              rows={6}
              value={draft.notes}
              onChange={(e) =>
                setDraft((d) => ({ ...d, notes: e.target.value }))
              }
              placeholder="Add a note…"
              className="mt-1 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600/30"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!dirty}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
          >
            Save changes
          </button>
        </div>
      </form>
    </aside>
  );
}
