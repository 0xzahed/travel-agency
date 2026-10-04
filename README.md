# Voyara — Travel Agency & Tour Management (frontend demo)

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Lucide.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Areas

| Area | Routes |
|---|---|
| Public site | `/`, `/tours`, `/tours/[slug]`, `/destinations`, `/visa`, `/about`, `/contact`, `/blog`, `/faq`, `/legal/*` |
| Booking flow | `/tours/[slug]/book` (6 steps) → `/booking/confirmation/[id]` |
| Visa | `/visa/apply` (7 steps), `/visa/track` |
| Customer portal | `/dashboard/*` (bookings, visa, saved, documents, payments, messages, profile, settings) |
| Admin | `/admin/*` (tours + itinerary builder, bookings, visa review, customers, payments, reports, content, support, users/roles) |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| States | `/status/[404|500|network|booking-failed|payment-failed|unauthorized|session-expired|locked]` |

## How the demo data works

- Seed data lives in `src/lib/data/*`; all mutations go through `src/lib/store.tsx` and persist to `localStorage`, so customer actions show up in admin and vice versa (booking → admin notification → confirm → customer notification, visa upload → admin document review → customer re-upload, etc.).
- **Reset:** Admin avatar menu → *Reset demo data*.
- Logged in as **Alex Morgan** by default. Any password works on `/login`; an `@voyara.travel` email lands in the admin panel.
- Payments are UI only. A card number ending in `0002` simulates a decline; bank transfer creates a *Pending* booking.
- Try visa tracking with `VISA-2026-00452` / `GB5520918`.
- `Ctrl K` opens search on the site, portal and admin.

## Chart palette

Series colours in `src/components/admin/charts.tsx` (`#0a83a0`, `#eb6834`, `#4a3aa7`) were checked with a colour-vision-deficiency validator (light mode, all checks pass). Every chart has a table view.
