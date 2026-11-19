# NH EV Trader Frontend

Next.js App Router storefront built with TypeScript and Tailwind CSS.

```bash
npm install
npm run dev
```

## Structure

- `src/app` — one route per customer task
- `src/components/layout` — site-wide navigation and footer
- `src/components/home` — homepage-only sections
- `src/components/commerce` — reusable product/cart UI
- `src/data` — temporary typed storefront repository; swap this for Payload API calls
- `src/types` — domain contracts shared across UI boundaries

No backend concerns are implemented here. Checkout, authentication, inventory writes, payments, and order persistence will be server-owned in `../backend`.
