import { STAGES, type Contact } from "../types/contact";

export const STORAGE_KEY = "contact-board:contacts:v1";

const isOptionalString = (v: unknown) =>
  v === undefined || typeof v === "string";

function isContact(v: unknown): v is Contact {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.company === "string" &&
    typeof c.role === "string" &&
    isOptionalString(c.email) &&
    isOptionalString(c.owner) &&
    isOptionalString(c.notes) &&
    Array.isArray(c.labels) &&
    c.labels.every((l) => typeof l === "string") &&
    (STAGES as readonly unknown[]).includes(c.stage)
  );
}

/** Returns saved contacts, or `fallback` if nothing valid is stored. */
export function loadContacts(fallback: Contact[]): Contact[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isContact)) return fallback;
    const ids = new Set(parsed.map((c) => c.id));
    return ids.size === parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveContacts(contacts: Contact[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // Storage may be full or blocked (private mode). The app keeps working in memory.
  }
}

export function clearSavedContacts(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
