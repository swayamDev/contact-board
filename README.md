# Contact Board

A small contacts-management prototype with two synchronized views of one dataset: a **Table** and a **Board**. Built as a frontend design and engineering exercise using fictional data. There is no backend, login, API or database.

## Features

- Table view: one row per contact with Name, Company, Email, Role, Owner, Labels, Stage and Notes.
- Board view: Lead, Prospect, Qualified and Customer columns with counts and an empty state ("No contacts yet").
- Table / Board switch. Closing the details panel keeps the current view.
- Details panel (opens from a row or a card). Stage (select) and Notes (textarea) are editable; other fields are read-only.
- Explicit **Save changes** and **Cancel**. Close (X) and Escape also discard unsaved edits.
- Missing emails, owners, labels and notes render as a subtle `—`.
- Add contact (header button): name is required, other fields are optional and show `—` when blank.
- Delete contact from the details panel, with an inline "Delete / Keep" confirmation.
- Drag a board card to another column to change its stage. The panel's Stage select is the keyboard-accessible alternative.
- Data is saved to `localStorage`, so it survives reloads. Invalid or corrupt saved data falls back to the sample data.
- Lightweight search across name, email, company, role, owner and labels.
- Keyboard support: rows and cards are focusable, Enter/Space opens them, and focus returns to the opener when the panel closes.

## Tech stack

React 19, TypeScript (strict), Vite, Tailwind CSS v4, native HTML5 drag-and-drop, Vitest + Testing Library (dev), [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`).

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
    NewContactPanel.tsx
    ui.tsx            # StageBadge, Avatar, LabelTag, Value (— fallback)
  data/
    contacts.ts       # 10 fictional contacts
    stageStyles.ts    # stage colours
  lib/storage.ts      # localStorage load/save with validation
  types/contact.ts    # Contact, Stage union, ContactDraft
  App.tsx             # owns shared state
  App.test.tsx, features.test.tsx   # behaviour tests
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

Vitest and Testing Library (jsdom), 14 tests across `src/App.test.tsx` and `src/features.test.tsx`:

- Core: same contacts in both views, empty board group, `—` for missing values, saved stage change moves the card, Cancel / X / Escape discard drafts, repeated saves create no duplicates, focus returns to the opener, search filters both views.
- Persistence: edits survive a remount, and corrupt, invalid or duplicate-id storage falls back to sample data.
- Add: name is required, the new contact appears in both views and storage, Cancel / Escape add nothing.
- Delete: confirmation can be undone, and a confirmed delete removes the contact from both views and storage.
- Drag-and-drop: a drop moves the card and updates the table and storage (simulated drag events).

I also checked drag-and-drop with a real mouse drag, reload persistence, add, delete and corrupt storage in headless Chromium by hand. Visual layout and real keyboard tab order are not covered by automated tests.

## Known limitations

- Persistence is per browser (`localStorage`). There is no sync between devices or tabs, and no "reset to sample data" control. Clear the `contact-board:contacts:v1` key to reset.
- Drag-and-drop uses native HTML5 drag events, so it works with a mouse but not on most touch screens. Use the Stage select in the panel there, or with the keyboard.
- Dragging a card while its panel is open refreshes the panel, which discards any unsaved draft for that contact.
- Editing fields other than Stage and Notes is not supported after a contact is created.
- The details panel is non-modal and does not trap focus.
- Sidebar links are placeholders.
- Desktop-first. Narrow screens scroll horizontally rather than reflow.

## Next improvements

- Edit all fields, and undo for delete.
- Sorting and filters by stage, owner and label.
- Touch-friendly and keyboard drag-and-drop (for example with `@dnd-kit`).
- Playwright end-to-end and visual regression tests.
- Sync via a real backend.
