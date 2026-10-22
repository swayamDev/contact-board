import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { initialContacts } from "./data/contacts";
import { STAGES } from "./types/contact";

const column = (stage: string) =>
  screen.getByRole("region", { name: new RegExp(stage) });
const cards = () => document.querySelectorAll("section [data-contact-id]");
const dataRows = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("sample data", () => {
  it("has 8-12 contacts with unique ids and at least one empty stage", () => {
    expect(initialContacts.length).toBeGreaterThanOrEqual(8);
    expect(initialContacts.length).toBeLessThanOrEqual(12);
    expect(new Set(initialContacts.map((c) => c.id)).size).toBe(
      initialContacts.length,
    );
    expect(
      STAGES.some((s) => !initialContacts.some((c) => c.stage === s)),
    ).toBe(true);
  });
});

describe("contacts app", () => {
  it("shows the same contacts in table and board", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(dataRows()).toHaveLength(initialContacts.length);
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(cards()).toHaveLength(initialContacts.length);
    expect(
      within(column("Customer")).getByText("No contacts yet"),
    ).toBeInTheDocument();
  });

  it("renders missing values as a dash, never undefined/null", () => {
    render(<App />);
    expect(document.body.textContent).not.toMatch(/undefined|null|\[object/);
    expect(screen.getAllByText("Not set").length).toBeGreaterThan(0);
  });

  it("saves a stage change and moves the card on the board", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    await user.selectOptions(screen.getByLabelText("Stage"), "Customer");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument(); // still on table view
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(
      within(column("Customer")).getByText("Daniel Kim"),
    ).toBeInTheDocument();
    expect(
      within(column("Prospect")).queryByText("Daniel Kim"),
    ).not.toBeInTheDocument();
  });

  it("Cancel, close and Escape discard drafts", async () => {
    const user = userEvent.setup();
    render(<App />);
    const original = initialContacts.find((c) => c.name === "Amara Okafor")!;

    for (const close of [
      () => user.click(screen.getByRole("button", { name: "Cancel" })),
      () => user.click(screen.getByRole("button", { name: "Close details" })),
      () => user.keyboard("{Escape}"),
    ]) {
      await user.click(screen.getByText("Amara Okafor"));
      await user.clear(screen.getByLabelText("Notes"));
      await user.type(screen.getByLabelText("Notes"), "DISCARD ME");
      await close();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("DISCARD ME")).not.toBeInTheDocument();
    }
    await user.click(screen.getByText("Amara Okafor"));
    expect(screen.getByLabelText("Notes")).toHaveValue(original.notes);
  });

  it("persists notes, shows latest values on reopen, and never duplicates", async () => {
    const user = userEvent.setup();
    render(<App />);
    for (const note of ["first", "second", "third"]) {
      await user.click(screen.getByText("Liam Chen"));
      await user.clear(screen.getByLabelText("Notes"));
      await user.type(screen.getByLabelText("Notes"), note);
      await user.click(screen.getByRole("button", { name: "Save changes" }));
    }
    expect(dataRows()).toHaveLength(initialContacts.length);
    await user.click(screen.getByText("Liam Chen"));
    expect(screen.getByLabelText("Notes")).toHaveValue("third");
  });

  it("returns focus to the row that opened the panel", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Elena Petrova"));
    await user.keyboard("{Escape}");
    expect(screen.getByText("Elena Petrova").closest("button")).toHaveFocus();
  });

  it("search filters both views from the same data", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Search contacts"), "copperline");
    expect(dataRows()).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(cards()).toHaveLength(1);
  });
});
