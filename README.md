# projecttt — Premium SaaS Analytics + AI Scoring

Production-grade SaaS-style app:
- Auth (JWT access + refresh cookie)
- Role-based access (USER / ADMIN)
- Admin console (users + audit logs)
- Analytics dashboards (charts, segments)
- Event ingestion API (cookie or X-API-Key)
- API Keys management (hash stored, shown once)
- CSV export
- JS SDK snippet (paste to any site to auto-track)
- Prisma + PostgreSQL
- Docker-first setup
- Rate limiting + security headers

---

## Screenshots (add your own)
Add 4 screenshots to impress clients:
- Dashboard
- Settings (API keys + snippet)
- Analytics (CSV export)
- Admin Audit logs

---

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Recharts
- Zod
- Docker

---

## Local run (Docker)

1) Create env:
```bash
cp .env.example .env