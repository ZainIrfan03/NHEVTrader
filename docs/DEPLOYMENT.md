# NH EV Trader Deployment Reference

This document is guidance only. No deployment has been performed.

## Services

- Deploy `frontend/` as the public Next.js storefront.
- Deploy `backend/` as the Payload/Next.js API and admin service.
- Use MongoDB Atlas for the production database.
- Use Cloudinary for production media storage.

## Backend environment

Configure the values documented in `backend/.env.example`:

- `PAYLOAD_SECRET`: a unique random production secret of at least 32 characters.
- `DATABASE_URL`: MongoDB Atlas connection string.
- `NEXT_PUBLIC_SERVER_URL`: public backend origin.
- `FRONTEND_URL`: public storefront origin.
- Cloudinary cloud name, key, secret and folder.
- Payment provider credentials after gateway onboarding.

Allow the backend host in Atlas network access and create a least-privilege database user. Keep all secrets in the hosting provider's encrypted environment settings.

## Frontend environment

Configure:

- `NEXT_PUBLIC_API_URL=https://<backend-domain>/api`
- `NEXT_PUBLIC_SITE_URL=https://<storefront-domain>`

## Release checks

Run before release:

```powershell
cd backend
npm ci
npm run typecheck
npm run build

cd ..\frontend
npm ci
npm run typecheck
npm run build
```

After release, verify `/api/health`, `/admin`, the storefront, a product detail page, customer login, a COD test order, sitemap and robots. Remove test records before launch.

## Payment activation

Online payment is deliberately unavailable while `PAYMENT_PROVIDER=manual`. Choose the client-approved gateway, add its server-side adapter and verified webhook, then test success, failure, cancellation and refund states in the provider sandbox before enabling the option in checkout.

