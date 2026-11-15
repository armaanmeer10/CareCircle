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
npm run test:coverage
npm run lint
npm run build
npm run preview
```

The production output is written to `dist/`.

Run `npm run format` to format app source and root configuration files with Prettier.

## Data and privacy

This version has no backend. The sample profile, role, medicines, appointments, dose history, care-circle members, and preferences are stored in the browser under the `carecircle.v1` localStorage key. Use a private browser profile or clear site storage to reset the demo. This local demo passcode is not authentication suitable for production.

The storage operations live in `src/lib/storage.js` so persistence can later be replaced with API calls. Missed-dose, upcoming-dose, and appointment emails are generated previews only; the app does not send email or reminders to external services. The 15-minute reminder runs in the current tab.

## Deploy to Vercel

Import the repository into Vercel or run `vercel`. Vercel detects Vite automatically; `vercel.json` rewrites client-side routes to `index.html`. The app uses no environment variables or secrets.

## Project layout

- `src/components/` — shared navigation, brand, and UI controls
- `src/pages/` — route-level CareCircle experiences
- `src/lib/storage.js` — localStorage-backed data layer and demo seed data
- `stitch-export/` — source designs, tokens, manifest, and shared assets

## How CareCircle meets the brief

| Requirement | Feature |
|---|---|
| Shared elder, caretaker, and family access | Passcode access and role selection; role badge switches the view. |
| View, add, edit, and manage medication schedules | Medicine list, details, and validated caretaker-only add/edit/delete form. |
| Track adherence | Elder “I took it” action, dose history, daily status, and 7-day insights use stored dose logs. |
| Monitor doctor appointments | Upcoming/past appointment list with validated caretaker add/edit and reminder preference. |
| Missed-dose, upcoming-dose, and appointment reminder email previews | Email preview selector generates recipient, subject, and body from the local medicines, dose logs, and appointment records. It never sends mail. |
| Elder-first escalation | Reminder preview shows the elder as first recipient and the caretaker after the configured delay (30 minutes by default). |
| Keep the elder at the centre | Large/extra-large text, high contrast, prominent “I took it,” and a medicine helper that directs medical questions to a clinician. |
| Local-first, replaceable persistence | `src/lib/storage.js` provides a schema-checked localStorage layer with seeded sample data and no backend. |

See [SECURITY.md](SECURITY.md) for the demo passcode, lockout, validation, headers, and front-end-only limitations.
