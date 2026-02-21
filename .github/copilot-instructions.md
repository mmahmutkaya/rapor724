# Copilot Instructions for Rapor 724

## Project Overview
**Rapor 724** is a Turkish-language React single-page application (SPA) for construction project management, focused on measurement take-offs (metraj) and project organisation.

Backend: MongoDB Atlas App Services (Realm) — all data access goes through the `useMongo` hook (`src/hooks/useMongo.js`).

## Tech Stack
- **React 18** (Create React App)
- **React Router v6** (`react-router-dom`)
- **TanStack React Query v5** (`@tanstack/react-query`) — server-state management
- **MUI v5** (`@mui/material`, `@mui/icons-material`) — UI components
- **Lodash** — utility helpers
- **MongoDB Atlas / Realm** — backend database and serverless functions

## Project Structure
```
src/
  App.js          — root route definitions
  index.js        — app entry point (QueryClient, StoreProvider, BrowserRouter)
  context/
    AuthContext.js — authentication state (LOGIN / LOGOUT reducer)
  components/
    store.js      — global StoreContext (selected items, UI state, theme)
    Layout.js     — main layout wrapper (AppBar, Sidebar, content area)
    Navbar.js / Sidebar.js / AppBar.js — navigation
    Form*.js      — create/edit forms for each entity
    Header*.js    — sub-header bars for list pages
    Show*.js      — collapsible section header components
  hooks/
    useMongo.js   — all MongoDB Realm data-fetching and mutation hooks
  functions/
    deleteLastSpace.js
    getLbsName.js / getWbsName.js
  pages/          — one folder per route (firmalar, projeler, wbs, lbs, mahaller,
                    pozlar, metraj*, ispaket*, birimfiyat, raporlar, …)
```

## Key Domain Concepts (Turkish → English)
| Turkish | English |
|---------|---------|
| Firma / Firmalar | Company / Companies |
| Proje / Projeler | Project / Projects |
| WBS | Work Breakdown Structure |
| LBS | Location Breakdown Structure |
| Mahal / Mahaller | Room / Space |
| Mahal Listesi | Room List |
| Poz / Pozlar | Unit-price line item |
| Metraj | Measurement take-off |
| Metraj Oluştur | Create measurement |
| Metraj Onayla | Approve measurement |
| İş Paketi / İş Paketleri | Work package |
| Birim Fiyat | Unit price |
| Para Birimi | Currency |
| Kadro | Personnel roster |
| Sıra No | Row / sequence number |

## Global State (StoreContext — `src/components/store.js`)
Most cross-page selections live in `StoreContext`:
- `selectedFirma`, `selectedProje` — active company and project
- `selectedWbs`, `selectedLbs` — active WBS / LBS node
- `selectedMahal`, `selectedMahalBaslik` — active room / room-category
- `selectedPoz`, `selectedPozBaslik` — active position / position-category
- `selectedMetrajVersiyon`, `selectedBirimFiyatVersiyon` — active version IDs
- `appUser` — logged-in user (persisted to `localStorage`)
- `Layout_Show` — controls which top-level view is rendered (`"login"` vs app)
- `myTema` — theme/colour palette object

## Coding Conventions
- Functional components with hooks only (no class components).
- Component filenames follow the pattern `Form<Entity>.js`, `Header<Entity>.js`, `Show<Entity>.js`.
- Page folders under `src/pages/<routename>/index.js`.
- All API calls are centralised in `src/hooks/useMongo.js`; components call hooks from there.
- Turkish identifiers are used throughout (variable names, function names, comments).
- MUI `sx` prop is preferred over separate CSS files for component-level styles.
- Theme colours are accessed via `myTema` from `StoreContext`, e.g. `myTema.renkler.baslik1`.

## Important Backend Notes (from README)
- Multi-step update functions (e.g. `update_hazirlananMetraj_selected`) must be made atomic — if a later step fails, earlier steps should be rolled back (transactions / error recovery needed).
- When DB data changes that affect ObjectId tracking, object IDs must be regenerated and the operation log must be halted.
- `hazirlananMetrajlar` rows become `isSelected` when copied to the approved side.
- `onaylananMetrajlar` rows that are revised get `hasSelectedCopy`; the new copy gets `isSelectedCopy`.
- `getHazirlananMetrajlar` also updates `_versionId` on the `onaylananMetraj` side.

## Environment
- `.env` file at repo root holds MongoDB connection strings / App ID (not committed).
- `mongorealm/` contains serverless function source — excluded from git.
- `tmpclaude-*` directories are agent temp dirs and are excluded from git.
