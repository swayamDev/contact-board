export const STAGES = ["Lead", "Prospect", "Qualified", "Customer"] as const;

export type Stage = (typeof STAGES)[number];

export interface Contact {
  id: string;
  name: string;
  email?: string;
  company: string;
  role: string;
  owner?: string;
  labels: string[];
  stage: Stage;
  notes?: string;
}

/** The only fields a user can edit in the details panel. */
export type ContactDraft = Pick<Contact, "stage"> & { notes: string };
