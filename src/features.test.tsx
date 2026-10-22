import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { ContactDetailsPanel } from "./components/ContactDetailsPanel";
import { initialContacts } from "./data/contacts";
import { getDropStage } from "./lib/board";
import { STORAGE_KEY, loadContacts } from "./lib/storage";

const dataRows = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1);
const column = (stage: string) =>
  screen.getByRole("region", { name: new RegExp(stage) });
const stored = () =>
  JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");

describe("persistence", () => {
  it("saves edits and restores them after a remount (reload)", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    await user.selectOptions(screen.getByLabelText("Stage"), "Customer");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    first.unmount();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(
      within(column("Customer")).getByText("Daniel Kim"),
    ).toBeInTheDocument();
  });

  it("falls back to sample data when stored data is corrupt or invalid", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadContacts(initialContacts)).toBe(initialContacts);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "x", stage: "Nope" }]),
    );
    expect(loadContacts(initialContacts)).toBe(initialContacts);
    // duplicate ids are rejected too
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([initialContacts[0], initialContacts[0]]),
    );
    expect(loadContacts(initialContacts)).toBe(initialContacts);
  });
});

describe("add contact", () => {
  it("requires a name, then adds the contact to both views with optional fields blank", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add contact" }));
    const dialog = screen.getByRole("dialog", { name: "New contact" });

    await user.click(
      within(dialog).getByRole("button", { name: "Add contact" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Name is required",
    );
    expect(dataRows()).toHaveLength(initialContacts.length);

    await user.type(within(dialog).getByLabelText(/Name/), "Zara Ahmed");
    await user.type(within(dialog).getByLabelText(/Labels/), "VIP, VIP, New");
    await user.selectOptions(
      within(dialog).getByLabelText("Stage"),
      "Customer",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Add contact" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(dataRows()).toHaveLength(initialContacts.length + 1);
    expect(stored()).toHaveLength(initialContacts.length + 1);
    expect(stored()[0]).toMatchObject({
      name: "Zara Ahmed",
      labels: ["VIP", "New"],
      stage: "Customer",
    });

    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(
      within(column("Customer")).getByText("Zara Ahmed"),
    ).toBeInTheDocument();
    expect(
      within(column("Customer")).queryByText("No contacts yet"),
    ).not.toBeInTheDocument();
  });

  it("Cancel and Escape add nothing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add contact" }));
    await user.type(screen.getByLabelText(/Name/), "Ghost");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Ghost")).not.toBeInTheDocument();
    expect(dataRows()).toHaveLength(initialContacts.length);
  });
});

describe("delete contact", () => {
  it("asks for confirmation, can be undone, and removes from both views and storage", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Sofia Rossi"));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Keep" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(dataRows()).toHaveLength(initialContacts.length);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      within(screen.getByRole("alert")).getByRole("button", { name: "Delete" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Sofia Rossi")).not.toBeInTheDocument();
    expect(dataRows()).toHaveLength(initialContacts.length - 1);
    expect(stored()).toHaveLength(initialContacts.length - 1);
    expect(screen.getByRole("button", { name: "Add contact" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(screen.queryByText("Sofia Rossi")).not.toBeInTheDocument();
  });
});

describe("drag and drop", () => {
  const [first] = initialContacts; // a Lead

  it("getDropStage returns the new stage only for a real move", () => {
    expect(getDropStage(initialContacts, first.id, "Customer")).toBe(
      "Customer",
    );
    expect(getDropStage(initialContacts, first.id, first.stage)).toBeNull(); // same column
    expect(getDropStage(initialContacts, first.id, null)).toBeNull(); // dropped outside
    expect(getDropStage(initialContacts, first.id, undefined)).toBeNull();
    expect(getDropStage(initialContacts, first.id, "Archived")).toBeNull(); // not a stage
    expect(getDropStage(initialContacts, "missing-id", "Customer")).toBeNull();
  });

  it("keeps unsaved notes, and follows the saved stage, when the contact changes under an open panel", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender } = render(
      <ContactDetailsPanel
        contact={first}
        onSave={onSave}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.clear(screen.getByLabelText("Notes"));
    await user.type(screen.getByLabelText("Notes"), "unsaved thought");

    // A drag-and-drop elsewhere moves this contact to Customer.
    rerender(
      <ContactDetailsPanel
        contact={{ ...first, stage: "Customer" }}
        onSave={onSave}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Notes")).toHaveValue("unsaved thought");
    expect(screen.getByLabelText("Stage")).toHaveValue("Customer");

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenCalledWith(first.id, {
      stage: "Customer",
      notes: "unsaved thought",
    });
  });

  it("board cards are real buttons that open the panel with Enter", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));
    const card = document.querySelector<HTMLElement>(
      `[data-contact-id="${first.id}"]`,
    )!;
    expect(card.tagName).toBe("BUTTON");
    card.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("dialog", { name: `Details for ${first.name}` }),
    ).toBeInTheDocument();
  });
});
