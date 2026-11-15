# CareCircle

CareCircle is an accessible, responsive React app for coordinating everyday elder care. Its interface is based on the screens and design tokens in `stitch-export/`.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The demo passcode is **123456**; choose Elder, Caretaker, or Family to open that role’s view.

## Verify and build

```sh
npm test
npm run build
npm run preview
```

The production output is written to `dist/`.

## Data and privacy

This version has no backend. The sample profile, role, medicines, appointments, dose history, care-circle members, and preferences are stored in the browser under the `carecircle.v1` localStorage key. Use a private browser profile or clear site storage to reset the demo. This local demo passcode is not authentication suitable for production.

The storage operations live in `src/lib/storage.js` so persistence can later be replaced with API calls. The missed-dose email is a generated preview only; the app does not send email or reminders to external services. The 15-minute reminder runs in the current tab.

## Deploy to Vercel

Import the repository into Vercel or run `vercel`. Vercel detects Vite automatically; `vercel.json` rewrites client-side routes to `index.html`. The app uses no environment variables or secrets.

## Project layout

- `src/components/` — shared navigation, brand, and UI controls
- `src/pages/` — route-level CareCircle experiences
- `src/lib/storage.js` — localStorage-backed data layer and demo seed data
- `stitch-export/` — source designs, tokens, manifest, and shared assets
