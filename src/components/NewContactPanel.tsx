import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, X } from "@phosphor-icons/react";
import { STAGES, type Contact, type Stage } from "../types/contact";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  FIELD_CLASS,
  PANEL_CLASS,
} from "./panelStyles";

interface Props {
  onCreate: (contact: Contact) => void;
  onClose: () => void;
}

interface Form {
  name: string;
  email: string;
  company: string;
  role: string;
  owner: string;
  labels: string;
  stage: Stage;
  notes: string;
}

const EMPTY: Form = {
  name: "",
  email: "",
  company: "",
  role: "",
  owner: "",
  labels: "",
  stage: "Lead",
  notes: "",
};

const optional = (v: string) => v.trim() || undefined;

export function NewContactPanel({ onCreate, onClose }: Props) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const nameError = submitted && form.name.trim() === "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (form.name.trim() === "") {
      nameRef.current?.focus();
      return;
    }
    onCreate({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: optional(form.email),
      company: form.company.trim(),
      role: form.role.trim(),
      owner: optional(form.owner),
      labels: [
        ...new Set(
          form.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
        ),
      ],
      stage: form.stage,
      notes: optional(form.notes),
    });
  }

  const text = (
    key: "email" | "company" | "role" | "owner",
    label: string,
    type = "text",
  ) => (
    <div>
      <label
        htmlFor={`${uid}-${key}`}
        className="text-xs font-medium text-zinc-500"
      >
        {label}
      </label>
      <input
        id={`${uid}-${key}`}
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className={FIELD_CLASS}
      />
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="New contact"
      className={PANEL_CLASS}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <h2 className="text-base font-semibold text-zinc-900">New contact</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close new contact form"
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <form
        noValidate
        onSubmit={submit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label
              htmlFor={`${uid}-name`}
              className="text-xs font-medium text-zinc-500"
            >
              Name <span className="text-zinc-500">(required)</span>
            </label>
            <input
              id={`${uid}-name`}
              ref={nameRef}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={nameError}
              aria-describedby={nameError ? `${uid}-name-err` : undefined}
              className={`${FIELD_CLASS} ${nameError ? "border-red-400" : ""}`}
            />
            {nameError && (
              <p
                id={`${uid}-name-err`}
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                Name is required.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {text("company", "Company")}
            {text("role", "Role")}
          </div>
          {text("email", "Email", "email")}
          {text("owner", "Owner")}
          <div>
            <label
              htmlFor={`${uid}-labels`}
              className="text-xs font-medium text-zinc-500"
            >
              Labels <span className="text-zinc-500">(comma separated)</span>
            </label>
            <input
              id={`${uid}-labels`}
              value={form.labels}
              onChange={(e) => set("labels", e.target.value)}
              placeholder="Inbound, Enterprise"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-stage`}
              className="text-xs font-medium text-zinc-500"
            >
              Stage
            </label>
            <div className="relative">
              <select
                id={`${uid}-stage`}
                value={form.stage}
                onChange={(e) => set("stage", e.target.value as Stage)}
                className={`${FIELD_CLASS} appearance-none pr-8`}
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
              htmlFor={`${uid}-notes`}
              className="text-xs font-medium text-zinc-500"
            >
              Notes
            </label>
            <textarea
              id={`${uid}-notes`}
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${FIELD_CLASS} resize-y`}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY}>
            Add contact
          </button>
        </div>
      </form>
    </div>
  );
}
