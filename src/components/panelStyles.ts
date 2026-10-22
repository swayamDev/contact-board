// xl and up: a non-modal panel beside the content. Below xl: a full-height drawer
// over the page (full width on phones), with the page behind it made inert.
export const PANEL_CLASS =
  "flex w-[400px] max-w-full shrink-0 flex-col border-l border-zinc-200 bg-white max-xl:fixed max-xl:inset-y-0 max-xl:right-0 max-xl:z-30 max-xl:shadow-xl";

export const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 md:text-sm placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600";

export const BTN_SECONDARY =
  "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 pointer-coarse:min-h-11 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600";

export const BTN_PRIMARY =
  "rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white pointer-coarse:min-h-11 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400";
