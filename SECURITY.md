# Security Notes

## Demo passcode

The demonstration passcode is `123456`. The app stores a salted SHA-256 digest and salt, not the passcode string, and uses the Web Crypto API to hash input before a constant-time digest comparison. Five invalid attempts trigger a 60-second lockout persisted in session storage so it survives a page reload in the same tab.

This is a front-end demonstration, not production authentication. The demo hash, salt, client code, and passcode are available to anyone who can inspect the app; the lockout can be bypassed by clearing browser state. SHA-256 is used here to satisfy the local demo's no-backend constraint, not as a substitute for a server-side password KDF such as Argon2id, scrypt, or PBKDF2 with suitable work factors. Production identity and authorization must be enforced by a trusted server.

## Validation and browser storage

Form data is trimmed, length-limited, and checked against field-specific allowed character rules before saving. Local storage reads are parsed and checked against a whitelist/schema; invalid records are dropped and malformed top-level data falls back to safe sample data. React renders user strings as text. Client validation and local storage do not protect data from a user controlling their own browser or from a compromised device. Do not enter real health information into this demo.

## Deployment headers

`vercel.json` sends a Content Security Policy, disables framing and MIME sniffing, limits referrers, and disables camera, microphone, and geolocation permissions. The CSP allows inline styles for the current client-side styling and Google Fonts for the Atkinson font. Revisit these allowances if the styling or font delivery changes.

## Reminders and third-party services

Reminder emails are previews only; no email is sent. The 15-minute reminder runs in the current tab and is not a background notification. No backend, analytics, credentials, or environment variables are required. `.env.example` contains no secrets; real `.env` files are ignored by Git.
