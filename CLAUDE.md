# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

GoPocket is a personal finance app: a Go/Gin/GORM/SQLite API (repo root) plus a Next.js UI (`gopocket-ui/`). For production, the UI is built as a static export and embedded directly into the Go binary (`gopocket-ui/embed.go` embeds `gopocket-ui/out`), so the deployable artifact is a single Go executable that serves both the API and the UI. In development the two run as separate processes on different ports and CORS is configured accordingly.

## Commands

### Backend (repo root)

- Run the API: `go run .` (or `make api`) — serves on `http://localhost:8080`, auto-migrates the SQLite DB (`gopocket.db`) on startup.
- Build the single-binary release (builds the UI first, then embeds it): `bash ./scripts/build.sh` (or `make build`) — output at `dist/gopocket`. `make run` builds and runs it.
- `go test ./...` — no Go tests currently exist in the repo, but this is the standard entry point if/when they're added.

### Frontend (`gopocket-ui/`)

- Dev server: `pnpm run dev` (or `make ui` from repo root) — serves on `http://localhost:3000` and talks to the API at `http://127.0.0.1:8080` by default (override with `NEXT_PUBLIC_API_URL`).
- Build: `pnpm run build` (static export via `output: "export"` in `next.config.ts`, emitted to `out/`).
- Lint: `pnpm run lint` / `pnpm run lint:fix`.
- Tests: `pnpm test` (Jest + ts-jest + jsdom). Run a single test file: `pnpm test -- hooks/test/use-request.test.ts`.
- Package manager is **pnpm** (there's a `pnpm-lock.yaml`); don't use npm/yarn commands here.

To run the full stack locally, start both the API (`go run .`) and the UI dev server (`cd gopocket-ui && pnpm run dev`) in parallel.

## Backend architecture

Each domain lives in its own package under `internal/` (`internal/category`, `internal/transaction`) with a consistent internal layering, described in `README.md`:

```
Endpoint (HTTP/gin) -> Validation -> Service -> Repository -> GORM/SQLite
```

Per package: `endpoint.go` (route registration + handlers), `validation.go`, `service.go` (interface + impl, business logic), `repository.go` (GORM queries), `model.go` (GORM model), `dto.go` (request/response shapes, separate from the model), `mapper.go` (model <-> DTO conversion). Endpoints are wired together with explicit constructor injection in `main.go` (`NewRepository` -> `NewService` -> `NewEndpoint`), then registered onto a shared `gin.Engine` in `router/router.go` under the `/api` group. Anything not matched by `/api/*` falls through to the embedded UI's static file server (`ui.FS()` + `http.FileServer`), which is why the SPA works from the same binary.

Shared HTTP helpers live in `internal/http`: `ReadBody[T]` (generic JSON body decode) and `WriteSuccess`/`WriteError` for the uniform response envelope (`{"status": bool, "data"|"error": ...}`). `models.BaseModel` (in `models/`) provides the common `ID` (UUID, generated in `BeforeCreate`), `CreatedAt`/`UpdatedAt`/`DeletedAt` (soft delete) fields embedded into every model.

Key domain detail: there is no separate "planned transaction" table — actual vs. planned is the same `Transaction` model, distinguished by whether `PaidAt` is set. The repository encodes this via `withActual`/`withPlanned` scopes (`paid_at IS NOT NULL` / `paid_at IS NULL`), and the transaction endpoint exposes it as separate route groups: `/api/transactions/actual` and `/api/transactions/planned` (plus `/api/transactions/planned/bulk` for creating a recurring series). Actual transactions sort by `paid_at DESC`; planned ones by `due_at ASC`. `Amount` is stored as an integer (cents). Categories are a `many2many` relation (`transaction_categories` join table) — a transaction can have multiple categories.

Goals (`internal/goal`, "Metas" in pt-br) are a target amount with an optional due date, linked many-to-many to transactions (`goal_transactions` join table; the `goal` package imports `transaction`, never the reverse). Progress is never stored — it is computed on read in `progress.go`: linked transactions with `paid_at` set count as *paid*, unpaid (planned) ones as *committed*, and `remaining = total - paid - committed` (floored at 0). `monthly_needed` spreads `remaining` over the calendar months left until the due date (partial month rounds up, minimum 1) and is null without a due date or once overdue. A transaction's full amount counts toward every goal it is linked to, regardless of its income/expense type. Links are added in bulk via `POST /api/goals/link-transactions` (add-only; existing links are skipped) and removed one at a time from the goal drawer. `PATCH /api/goals/:id` replaces every field (unlike other update endpoints) so `due_at` can be cleared with `null`.

## Frontend architecture

Next.js App Router (`gopocket-ui/app/`) with one page per feature (`dashboard`, `transactions`, `planned`, `categories`). Cross-cutting concerns are provided at the root layout (`app/layout.tsx`) via React context, wrapped in this order: `ThemeProvider` -> `I18nProvider` -> `CategoryProvider`.

- `contexts/category-context.tsx` fetches all categories once and exposes `categories`/`categoryMap`/`refetch` app-wide via `useCategories()` — components needing category data/lookups should read from this instead of fetching directly.
- `contexts/i18n-context.tsx` provides `t()` for translations backed by `locales/en.ts` and `locales/pt-br.ts` (locale persisted to `localStorage`); add new UI strings to both locale files.
- `contexts/theme-context.tsx` handles light/dark mode (daisyUI).

Data access: `services/*.service.ts` wrap `services/http-client.ts`, which calls `${NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080"}${path}` and unwraps the backend's `{status, data, error}` envelope, throwing `HttpError` on failure. Components call services through `hooks/use-request.ts` (`useRequest({ callback })` -> `{ call, result, loading, error }`), the standard pattern for async data fetching/mutation in this codebase.

UI is styled with Tailwind v4 + daisyUI (no component library like MUI/Radix — dialogs, dropdowns, etc. in `components/` are hand-rolled). Notably, `components/modal.tsx` renders a plain (non-`showModal()`) `<dialog>` styled by daisyUI's `.modal`/`.modal-box` classes (`overflow-y: auto`, `max-height: 100vh`) rather than using the native top layer — any floating UI inside a modal (dropdowns, popovers) must account for this clipping, e.g. by portaling to `document.body` and positioning via `getBoundingClientRect` (see `components/category-multi-select.tsx`).

Monetary amounts are handled as integer cents end-to-end to match the backend; use `utils/currency.ts` (`formatCurrentyScale`, `formatCurrencyString`) rather than dividing/formatting ad hoc.
