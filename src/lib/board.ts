import { STAGES, type Contact, type Stage } from "../types/contact";

const isStage = (v: unknown): v is Stage =>
  typeof v === "string" && (STAGES as readonly string[]).includes(v);

/**
 * Decides where a dropped card should go. Returns the new stage, or null when
 * nothing should change (dropped outside a column, unknown contact, same stage).
 */
export function getDropStage(
  contacts: Contact[],
  activeId: string,
  overId: string | number | null | undefined,
): Stage | null {
  if (!isStage(overId)) return null;
  const contact = contacts.find((c) => c.id === activeId);
  if (!contact || contact.stage === overId) return null;
  return overId;
}
