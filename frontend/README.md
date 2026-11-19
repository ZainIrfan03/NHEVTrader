# NH EV Trader Frontend

Next.js App Router storefront built with TypeScript and Tailwind CSS.

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`. The local storefront expects Payload at `http://localhost:3001/api`.

## Structure

- `src/app` — one route per customer task
- `src/components/layout` — site-wide navigation and footer
- `src/components/home` — homepage-only sections
- `src/components/commerce` — reusable product/cart UI
- `src/lib/catalog.ts` — Payload catalog adapter with development fallback
- `src/lib/content.ts` — CMS homepage and site-settings adapter
- `src/providers` — catalog, authentication, cart and wishlist state
- `src/types` — domain contracts shared across UI boundaries

Products, CMS content, customer authentication, saved addresses, orders, contact inquiries and checkout are connected to `../backend`. Online payment remains disabled until payment-gateway onboarding is complete.

Verify with:

```bash
npm run typecheck
npm run build
```
