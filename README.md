# NH EV Trader

The project is intentionally split into two independent applications:

- `frontend/` — customer-facing Next.js storefront
- `backend/` — Payload CMS, MongoDB and commerce API service

The applications are connected through Payload REST endpoints. Run MongoDB and the backend on port `3001`, then run the frontend on port `3000`.

Handover references:

- `docs/ADMIN-GUIDE.md`
- `docs/DEPLOYMENT.md`
