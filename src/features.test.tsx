import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { initialContacts } from "./data/contacts";
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
  it("moves a card to another column and updates the table and storage", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));

    const card = screen.getByText("Amara Okafor").closest("li")!;
    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (k: string, v: string) => (data[k] = v),
      getData: (k: string) => data[k] ?? "",
      effectAllowed: "",
      dropEffect: "",
    };
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(column("Customer"), { dataTransfer });
    fireEvent.drop(column("Customer"), { dataTransfer });
    fireEvent.dragEnd(card, { dataTransfer });

    expect(
      within(column("Customer")).getByText("Amara Okafor"),
    ).toBeInTheDocument();
    expect(
      within(column("Lead")).queryByText("Amara Okafor"),
    ).not.toBeInTheDocument();
    expect(
      stored().find((c: { name: string }) => c.name === "Amara Okafor").stage,
    ).toBe("Customer");

    await user.click(screen.getByRole("button", { name: "Table" }));
    const row = screen.getByText("Amara Okafor").closest("tr")!;
    expect(within(row).getByText("Customer")).toBeInTheDocument();
    expect(dataRows()).toHaveLength(initialContacts.length);
  });

  it("keeps unsaved notes in an open panel when its card is dragged to another stage", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));
    await user.click(screen.getByText("Amara Okafor"));
    const notes = screen.getByLabelText("Notes");
    await user.clear(notes);
    await user.type(notes, "unsaved thought");

    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (k: string, v: string) => (data[k] = v),
      getData: (k: string) => data[k] ?? "",
      effectAllowed: "",
      dropEffect: "",
    };
    const card = screen.getAllByText("Amara Okafor")[0].closest("li")!;
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(column("Customer"), { dataTransfer });

    expect(screen.getByLabelText("Notes")).toHaveValue("unsaved thought");
    expect(screen.getByLabelText("Stage")).toHaveValue("Customer");
    // Moving via drag is already saved; only the notes edit is pending.
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      stored().find((c: { name: string }) => c.name === "Amara Okafor"),
    ).toMatchObject({
      stage: "Customer",
      notes: "unsaved thought",
    });
  });
});
