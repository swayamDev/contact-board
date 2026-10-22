import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import { initialContacts } from "./data/contacts";

// jsdom has no layout, so we fake which breakpoints match.
// phone = below 48rem (md), drawer = below 80rem (xl).
function setViewport(kind: "desktop" | "tablet" | "phone") {
  const matches = (q: string) =>
    q.includes("48rem")
      ? kind === "phone"
      : q.includes("80rem")
        ? kind !== "desktop"
        : false;
  window.matchMedia = ((query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  // @ts-expect-error restore jsdom's default (no matchMedia)
  delete window.matchMedia;
});

describe("phone layout (below 768px)", () => {
  it("shows the Table view as a list of cards with stage badges, same 10 contacts", () => {
    setViewport("phone");
    render(<App />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Contacts" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(
      initialContacts.length,
    );
    expect(within(list).getAllByText("Lead").length).toBeGreaterThan(0); // stage badge
  });

  it("opens, edits and saves from the list, and the board agrees", async () => {
    setViewport("phone");
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    await user.selectOptions(screen.getByLabelText("Stage"), "Customer");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("list", { name: "Contacts" })).toBeInTheDocument(); // still on the Table view
    await user.click(screen.getByRole("button", { name: "Board" }));
    const customer = screen.getByRole("region", { name: /Customer/ });
    expect(within(customer).getByText("Daniel Kim")).toBeInTheDocument();
  });

  it("search filters the list", async () => {
    setViewport("phone");
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Search contacts"), "copperline");
    expect(
      within(screen.getByRole("list", { name: "Contacts" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(1);
    await user.clear(screen.getByLabelText("Search contacts"));
    await user.type(screen.getByLabelText("Search contacts"), "zzzz");
    expect(
      screen.getByText("No contacts match your search."),
    ).toBeInTheDocument();
  });
});

describe("drawer (below 1280px)", () => {
  it.each(["tablet", "phone"] as const)(
    "%s: panel is a modal drawer and the page behind it is inert",
    async (kind) => {
      setViewport(kind);
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByText("Daniel Kim"));
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
      expect(screen.getByRole("main")).toHaveAttribute("inert");
      expect(
        document.querySelector("aside:not([role=dialog])"),
      ).toHaveAttribute("inert");
    },
  );

  it("tapping the backdrop closes the drawer without saving, and the page is usable again", async () => {
    setViewport("tablet");
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Daniel Kim"));
    await user.type(screen.getByLabelText("Notes"), "backdrop draft");
    await user.click(document.querySelector<HTMLElement>(".fixed.inset-0")!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).not.toHaveAttribute("inert");
    expect(screen.queryByText(/backdrop draft/)).not.toBeInTheDocument();
    await user.click(screen.getByText("Daniel Kim"));
    expect(screen.getByLabelText("Notes")).not.toHaveValue(
      expect.stringContaining("backdrop draft"),
    );
  });

  it("the new-contact form is also a modal drawer with a backdrop", async () => {
    setViewport("tablet");
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add contact" }));
    expect(screen.getByRole("dialog", { name: "New contact" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(document.querySelector(".fixed.inset-0")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("desktop layout (1280px and up)", () => {
  it("keeps the panel non-modal beside the content, with no backdrop and no inert page", async () => {
    setViewport("desktop");
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    await user.click(screen.getByText("Daniel Kim"));
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "false");
    expect(screen.getByRole("main")).not.toHaveAttribute("inert");
    expect(document.querySelector(".fixed.inset-0")).not.toBeInTheDocument();
  });
});

describe("no matchMedia (jsdom, older environments)", () => {
  it("falls back to the desktop layout instead of crashing", () => {
    expect(window.matchMedia).toBeUndefined();
    render(<App />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
