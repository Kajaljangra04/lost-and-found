# Lost & Found — UI Style Guide (modern refined dark)

This is the single source of truth for the redesign. Every screen must follow it.

## 1. Design tokens (already configured in `tailwind.config.js`)

| Token | Classes | Use |
|---|---|---|
| Canvas | `bg-canvas` | Page background (set on `body`, **not** on sections) |
| Surface | `bg-surface`, `bg-surface-2`, `bg-surface-3`, `bg-surface-4` | Cards, inputs, dropdowns, raised fills (surface-4 = strongest) |
| Lines | `border-line`, `border-line-strong` | Hairline borders / emphasized borders |
| Text | `text-ink` (headings), `text-ink-dim` (body), `text-ink-mute` (meta/captions) | Replaces every `gray-300/400/500` text |
| Accent | `text-accent`, `bg-accent`, `bg-accent-strong`, `text-accent-soft` | Links, focus, active states, one accent per screen |
| Status | `ok` (emerald), `warn` (amber), `bad` (rose) e.g. `text-ok`, `bg-bad/10` | Success/found, pending, error/lost |
| Shadows | `shadow-card`, `shadow-pop`, `shadow-glow` | Cards, elevated popups, accent glow |
| Animations | `animate-fade-in`, `animate-fade-up`, `animate-shimmer` | Sparingly, for entrances |

## 2. Component classes (already defined in `src/index.css`)

- **Buttons**: `.btn` + one of `.btn-primary` (white/crisp — default for form submits),
  `.btn-brand` (accent fill — hero / high-emphasis), `.btn-outline`, `.btn-ghost`,
  `.btn-danger`. Sizes: `.btn-sm`, `.btn-lg`. Add `w-full` for full-width.
- **Surfaces**: `.card` (panel), `.card-hover` (subtle lift + border brighten).
- **Forms**: `.field` (input/select/textarea), `.field-label`, `.field-error`.
- **Badges**: `.badge` + `.badge-ok` / `.badge-danger` / `.badge-warn` / `.badge-accent` / `.badge-neutral`.
- **Headings**: `.eyebrow`, `.section-title`, `.section-sub`, `.section-head` (centered header block), `.text-gradient` (headline emphasis only), `.link-accent`.
- **Loading**: `.skeleton` for shimmer placeholders.
- **Page root**: `.page` = `min-h-screen`, transparent background.

## 3. Hard rules

1. **No background gradients on sections/pages.** Page wrappers and sections stay
   transparent so the canvas + ambient glow shows through. Gradients are allowed only for:
   the brand logo mark, `.text-gradient` headline emphasis, and image overlays.
   Panels/cards use `bg-surface*`.
2. **No gradient buttons** (`bg-gradient-to-r from-cyan-600…` is the old look).
   Use the `.btn` classes instead.
3. **No emoji icons.** Use `react-icons` (the project already depends on it).
   Replace 📅 📍 ⚠ ✓ etc. with `FaCalendarAlt`, `FaMapMarkerAlt`, badges, etc.
4. **No `hover:scale-105` / `transform hover:scale-*` on cards or buttons.**
   Cards → `.card-hover`. Buttons already do `active:scale-[0.98]`.
5. **No `shadow-2xl`, no `text-gradient` on every heading** — keep gradients rare so
   they read as intentional.
6. **Status semantics**: found/resolved → `badge-ok` (emerald); lost/urgent → `badge-danger`
   (rose); pending → `badge-warn` (amber); neutral → `badge-neutral`.
7. **Radii**: cards/panels `rounded-2xl`, controls/inputs/buttons `rounded-xl`,
   small elements `rounded-lg`. Avoid `rounded-3xl` and square corners.
8. **Section rhythm**: `<section className="py-16 lg:py-24">` with inner
   `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`. Section headers use `.section-head`
   with `.eyebrow` + `.section-title` + `.section-sub`.
9. **Skeletons**: `className="skeleton"` + sizing (e.g. `h-4 w-2/3 skeleton`).
   Flowbite `<Spinner />` stays, with `className="text-accent"`.
10. **Custom interactive elements** (not `.btn`/`.field`) need
    `focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas`
    or a `rounded-lg` + `hover:bg-white/5` treatment.
11. **Tables** (Flowbite): head cells → `text-[11px] uppercase tracking-wider text-ink-mute`,
    body cells → `text-sm text-ink-dim`, row borders → `border-line`,
    row hover → `hover:bg-white/[0.03]`. Wrap in `.card overflow-hidden`.
12. **Flowbite overlays** (Modal/Dropdown): pass `className="border border-line bg-surface shadow-pop"`
    so panels match the system.

## 4. Constraints

- **Do not change behavior**: no edits to data fetching, Redux hooks, form `register`
  names, validation, IDs, navigation targets, `onClick` handlers, or props.
  Only classNames, JSX structure needed for styling, and icon imports may change.
- Keep every existing feature reachable (filters, pagination, modals, demo logins…).
- Run `npm run build` in `frontend/` before you finish and fix any type errors you introduced.
