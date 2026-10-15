# Rubino & Sons Property Services LLC — Website

Node/Express + SQLite site with a quote form and password-protected lead dashboard (`/admin`).

## Run locally
    npm install
    cp .env.example .env   # then edit values
    node --env-file=.env server.js   # or export the vars and `npm start`

## Deploy (Render)
- Build: `npm install` · Start: `npm start` · Node 20.x (pinned in `.node-version` and `engines`).
- Set env vars from `.env.example`. Mount a persistent disk and point `DB_PATH` at it (e.g. `/var/data/leads.db`), otherwise leads reset on deploy.
- Set `NODE_ENV=production`.

## Before launch
- Set NOTIFY_EMAIL + SMTP sender, a strong ADMIN_PASSWORD and SESSION_SECRET.
- Once the client's domain is chosen, make the `og:image` URL in `public/index.html` absolute (https://their-domain/images/og.jpg).
- Confirm with Eric: full name/story, address display, pricing, snow service details, Yardbook vs. on-site quote form.
