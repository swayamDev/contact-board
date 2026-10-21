# Contact Board

A small contacts-management prototype with two synchronized views of one dataset: a **Table** and a **Board**. Built as a frontend design and engineering exercise using fictional data. There is no backend, login, API or database.

## Features

- Table view: one row per contact with Name, Company, Email, Role, Owner, Labels, Stage and Notes.
- Board view: Lead, Prospect, Qualified and Customer columns with counts and an empty state ("No contacts yet").
- Table / Board switch. Closing the details panel keeps the current view.
- Details panel (opens from a row or a card). Stage (select) and Notes (textarea) are editable; other fields are read-only.
- Explicit **Save changes** and **Cancel**. Close (X) and Escape also discard unsaved edits.
- Missing emails, owners, labels and notes render as a subtle `—`.
- Lightweight search across name, email, company, role, owner and labels.
- Keyboard support: rows and cards are focusable, Enter/Space opens them, and focus returns to the opener when the panel closes.

## Tech stack

React 19, TypeScript (strict), Vite, Tailwind CSS v4, Vitest + Testing Library (dev), [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`).

## Getting started

Prerequisites: Node.js 20+ and npm (or pnpm).

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check and build for production
npm run preview    # serve the production build
npm run lint       # run ESLint
npm test           # run unit/integration tests
```

## Project structure

```
src/
  components/
    AppHeader.tsx, Sidebar.tsx, ViewSwitcher.tsx
    ContactsTable.tsx, ContactsBoard.tsx, ContactCard.tsx
    ContactDetailsPanel.tsx
    ui.tsx            # StageBadge, Avatar, LabelTag, Value (— fallback)
  data/
    contacts.ts       # 10 fictional contacts
    stageStyles.ts    # stage colours
  types/contact.ts    # Contact, Stage union, ContactDraft
  App.tsx             # owns shared state
  App.test.tsx        # behaviour tests
  test/setup.ts
```

## Design decisions and trade-offs

- **One source of truth.** `App` holds `contacts`. The table reads it directly and the board derives each column with `filter` by stage, so the views cannot drift apart.
- **Drafts are local to the panel.** The panel copies `stage` and `notes` into its own state, and only Save writes back, by contact `id`. Cancel, X and Escape just unmount the panel, so nothing leaks into the shared data. Save is disabled until something changes.
- **Stable IDs.** Contacts are looked up by `id`, never by array index. The panel is keyed by `id` so its draft resets for each contact.
- **Panel layout.** On wide screens the panel sits beside the content so the table or board stays visible. Below 1280px it overlays the content instead of squeezing it.
- **Focus.** Opening the panel focuses the Stage select. Closing returns focus to the row or card, found by `data-contact-id`, which still works after a stage change moves a card to another column.
- **Initials, not photos**, and a system font stack to avoid extra dependencies.

## Testing

```bash
npm test
```

Vitest and Testing Library (jsdom) cover the core flows in `src/App.test.tsx`: table and board show the same contacts, an empty board group, missing values render as `—`, a saved stage change moves the card, Cancel / X / Escape discard drafts, repeated saves create no duplicates and reopen with the latest values, focus returns to the opener, and search filters both views.

I also checked the UI by hand in headless Chromium, including a 1024px-wide layout. Visual layout and real keyboard tabbing order are not covered by automated tests.

## Known limitations

- Not implemented: adding or deleting contacts, drag-and-drop, advanced filters, animations.
- Data resets on reload (no persistence).
- The details panel is non-modal and does not trap focus.
- Sidebar links are placeholders.
- Desktop-first. Narrow screens scroll horizontally rather than reflow.

## Next improvements

- Add Playwright end-to-end and visual regression tests.
- Drag-and-drop between board columns.
- Persist to `localStorage` and add contact creation.
- Sorting and filters by stage, owner and label.
