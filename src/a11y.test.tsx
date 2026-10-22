import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { initialContacts } from "./data/contacts";

describe("keyboard and focus", () => {
  it("delete confirmation moves focus to Keep, and back to Delete when kept", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Sofia Rossi"));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("button", { name: "Keep" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opening the panel focuses the Stage select", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    expect(screen.getByLabelText("Stage")).toHaveFocus();
  });

  it("Escape closes the panel even when focus has moved outside it (non-modal)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    await user.type(screen.getByLabelText("Notes"), "unsaved");
    screen.getByRole("button", { name: "Board" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByText("Daniel Kim"));
    expect(screen.getByLabelText("Notes")).not.toHaveValue(
      expect.stringContaining("unsaved"),
    );
  });

  it("Tab can leave the panel: there is no focus trap", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    // Save is disabled until there are edits, so Cancel is the last tab stop.
    screen.getByRole("button", { name: "Cancel" }).focus();
    await user.tab();
    expect(screen.getByRole("dialog")).not.toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it("Escape closes the new-contact form and returns focus to Add contact", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add contact" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add contact" })).toHaveFocus();
  });
});

describe("semantics and names", () => {
  it("each table row has one real button as its keyboard target", () => {
    render(<App />);
    const buttons = document.querySelectorAll("tbody [data-contact-id]");
    expect(buttons).toHaveLength(initialContacts.length);
    buttons.forEach((b) => expect(b.tagName).toBe("BUTTON"));
    expect(document.querySelectorAll("tbody tr[tabindex]")).toHaveLength(0);
  });

  it("placeholder navigation is disabled, so it adds no tab stops", () => {
    render(<App />);
    for (const name of ["Overview", "Companies", "Settings"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(screen.getByRole("link", { name: "Contacts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("every control in the details panel has an accessible name and every field a label", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    const dialog = screen.getByRole("dialog", {
      name: "Details for Daniel Kim",
    });
    for (const el of dialog.querySelectorAll<HTMLElement>(
      "button, select, textarea, input",
    )) {
      expect(el).toHaveAccessibleName();
    }
    expect(screen.getByLabelText("Stage")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close details" }),
    ).toBeInTheDocument();
  });

  it("every control in the new-contact form has an accessible name", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add contact" }));
    const dialog = screen.getByRole("dialog", { name: "New contact" });
    for (const el of dialog.querySelectorAll<HTMLElement>(
      "button, select, textarea, input",
    )) {
      expect(el).toHaveAccessibleName();
    }
  });

  it("view switcher exposes its state with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
