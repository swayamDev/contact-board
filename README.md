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
- Drag a board card to another column to change its stage, with a mouse or by long-pressing on a touch screen (`@dnd-kit/core`). Keyboard users change stage with the Stage select in the details panel.
- Data is saved to `localStorage`, so it survives reloads. Invalid or corrupt saved data falls back to the sample data.
- Responsive from 320px phones to ultrawide monitors (see below).
- Lightweight search across name, email, company, role, owner and labels.
- Keyboard support: each table row has a real button, each board card is a button, Enter/Space opens them, and focus returns to the opener when the panel closes. Escape closes the panel without saving.

## Tech stack

React 19, TypeScript (strict), Vite, Tailwind CSS v4, `@dnd-kit/core` (drag-and-drop), Vitest + Testing Library (dev), [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`).

## Getting started

Prerequisites: Node.js **22.22 or newer** (or 24.15+) and npm or pnpm. Vite and ESLint alone run on Node 20.19+, so `dev`, `build` and `lint` work there, but the test runner (Vitest 5 and jsdom 30) needs Node 22.22+. `pnpm-lock.yaml` is committed and up to date; with npm, a plain `npm install` works.

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
    ContactsTable.tsx, ContactsList.tsx, ContactsBoard.tsx, ContactCard.tsx
    ContactDetailsPanel.tsx
    NewContactPanel.tsx
    panelStyles.ts    # shared panel/field/button class names
    ui.tsx            # StageBadge, Avatar, LabelTag, Value (— fallback)
  data/
    contacts.ts       # 10 fictional contacts
    stageStyles.ts    # stage colours
  hooks/useMediaQuery.ts   # matchMedia subscription (false where unavailable)
  lib/storage.ts      # localStorage load/save with validation
  lib/board.ts        # drag-and-drop drop rule (pure, unit-tested)
  types/contact.ts    # Contact, Stage union, ContactDraft
  App.tsx             # owns shared state
  App.test.tsx, features.test.tsx, a11y.test.tsx, responsive.test.tsx   # behaviour tests
  test/setup.ts
```

## Design decisions and trade-offs

- **One source of truth.** `App` holds `contacts`. The table reads it directly and the board derives each column with `filter` by stage, so the views cannot drift apart.
- **Drafts are local to the panel.** The panel keeps only the fields the user has touched (`stage` and `notes`); every other value follows the saved contact, so a drag-and-drop move can't wipe unsaved notes. Only Save writes back, by contact `id`. Cancel, X and Escape just unmount the panel, so nothing leaks into the shared data. Save is disabled until something changes.
- **Stable IDs.** Contacts are looked up by `id`, never by array index. The panel is keyed by `id` so its draft resets for each contact.
- **Responsive layout.** Three breakpoints, using the same values as Tailwind (`md` 768px, `xl` 1280px). `xl` and up: the details panel sits beside the content and is non-modal, so the table or board stays usable. Below `xl`: the panel becomes a full-height drawer over a dimmed backdrop (full width on phones). The page behind it is made `inert`, so keyboard focus can't land on controls hidden behind the drawer. Tapping the backdrop, X, Cancel or Escape closes it without saving. Below `md` (phones): the sidebar is hidden, the header wraps to two rows, and the Table view shows a list of cards instead of a 1,100px spreadsheet (same contacts, same panel; the remaining fields are in the panel). On tablets the table keeps all 8 columns, scrolls sideways, and pins the Name column. The board scrolls sideways with swipeable columns on phones and fills the width on larger screens (columns are capped on ultrawide monitors). On touch devices, targets are at least 44px and form fields use 16px text, so iOS Safari doesn't zoom on focus.
- **Drag-and-drop.** `@dnd-kit/core` with mouse and touch sensors only. The mouse sensor needs 6px of movement and the touch sensor a 250ms press, so plain clicks, taps and swipe-scrolling still work. There is deliberately no keyboard sensor: Enter/Space already open a card, and the Stage select is the keyboard path.
- **Focus.** Opening the panel focuses the Stage select. Closing returns focus to the row or card, found by `data-contact-id`, which still works after a stage change moves a card to another column.
- **Initials, not photos**, and a system font stack to avoid extra dependencies.

## Testing

```bash
npm test
```

Vitest and Testing Library (jsdom), 35 tests across `src/App.test.tsx`, `src/features.test.tsx`, `src/a11y.test.tsx` and `src/responsive.test.tsx`:

- Core: same contacts in both views, empty board group, `—` for missing values, saved stage change moves the card, Cancel / X / Escape discard drafts, repeated saves create no duplicates, focus returns to the opener, search filters both views.
- Persistence: edits survive a remount, and corrupt, invalid or duplicate-id storage falls back to sample data.
- Add / delete: name is required, Cancel / Escape add nothing, delete needs confirmation and removes the contact from both views and storage.
- Drag-and-drop: the drop rule (`getDropStage`) is unit-tested, and an open panel keeps unsaved notes while following an external stage change. The drag gesture itself is not simulated in jsdom.
- Accessibility: Stage select gets focus on open, Escape works from outside the panel, there is no focus trap, delete confirmation focus handling, every control has an accessible name, placeholder nav items are not tab stops, `aria-pressed` on the view switch.
- Responsive (breakpoints faked with a mocked `matchMedia`, since jsdom has no layout): phone list instead of table, drawer with `aria-modal` and an inert page, backdrop closes without saving, desktop stays non-modal with no backdrop, and a safe fallback when `matchMedia` is missing.

### Accessibility and compatibility checks (manual, in a browser)

These were run in headless **Chromium** with Playwright and axe-core, but they are not committed as automated tests:

- axe-core (WCAG 2.0/2.1/2.2 A and AA plus best-practice rules): 0 violations on the table, board, details panel, delete confirmation and new-contact form.
- Real keyboard: tab order, Enter / Space on the view switch, rows and cards, Escape, Cancel, X and Save, focus returning to the opener (including after a stage change moves a card), and a visible focus ring on every tabbed control.
- Real mouse drag and a CDP-emulated touch long-press drag moved cards correctly. A tap opens a card, and a quick swipe does not drag.
- 15 viewport profiles, from a 320×568 phone through iPhone, Pixel and iPad sizes (portrait and landscape) to 1920×1080 and 2560×1080, in both views with the panel open: no sideways page scroll, header controls neither clipped nor overlapping, panel and its Save button inside the viewport, touch targets at least 44px on touch profiles, 16px form fields on phones.
- Touch (emulated): tap opens a card; a quick swipe scrolls the board instead of dragging; a long-press drag moves a card into the next column; Add, edit and delete work on a phone-sized screen.
- Resizing live across 1440 → 1100 → 700 → 390 → 1440px with the panel open keeps an unsaved draft and switches correctly between side panel, drawer and list.

**Not verified:** Firefox and Safari/WebKit (not installable in my environment), real phones and tablets (the touch and device checks used Chromium's emulation, which doesn't reproduce iOS Safari's toolbar or keyboard behaviour), a real screen reader (NVDA, JAWS or VoiceOver), and Windows high-contrast mode.

## Known limitations

- Persistence is per browser (`localStorage`). There is no sync between devices or tabs, and no "reset to sample data" control. Clear the `contact-board:contacts:v1` key to reset.
- Drag-and-drop has no keyboard mode. Use the Stage select in the panel instead. Dragging with a screen reader is not supported.
- Editing fields other than Stage and Notes is not supported after a contact is created.
- Beside the content (1280px and up) the details panel is non-modal and does not trap focus. Below that it is a modal drawer: the page behind it is inert, but focus is not looped inside it.
- Sidebar items other than Contacts are disabled placeholders.
- On phones, the Table view is a card list that shows name, role, company, labels and stage; the other fields are in the details panel. On tablets and narrow desktops the table scrolls sideways (Name stays pinned).

## Next improvements

- Edit all fields, and undo for delete.
- Sorting and filters by stage, owner and label.
- Keyboard drag-and-drop with a separate drag handle (so Enter/Space can still open the card).
- Commit the browser checks as Playwright end-to-end tests with axe, and add Firefox and WebKit to the run.
- Sync via a real backend.
