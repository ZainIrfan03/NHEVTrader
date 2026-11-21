# NH EV Trader Backend

Payload CMS and Next.js backend for NH EV Trader. It runs independently from the storefront and owns the commerce data and admin dashboard.

## Included

- Staff authentication with administrator and store-manager roles
- Customer registration, login, profiles and saved addresses
- Products, categories, variants, pricing and stock
- Inventory audit logs
- Orders with COD and online-payment states
- Server-side checkout validation and price calculation
- Banners, pages, homepage and site settings
- Contact inquiries
- Storefront chatbot grounded in live products and site settings
- Optional OpenAI-compatible AI responses with a built-in catalog and FAQ fallback
- Local media storage with automatic Cloudinary switching when credentials are provided
- Payload REST and GraphQL APIs

## Local development

Requirements: Node.js 20.18.1 or newer and MongoDB.

```bash
npm install
npm run seed
npm run dev
```

Open:

- Backend status: http://localhost:3001
- Admin dashboard: http://localhost:3001/admin
- Health endpoint: http://localhost:3001/api/health
- REST API: http://localhost:3001/api
- GraphQL playground: http://localhost:3001/api/graphql-playground

Administrator creation is restricted to authenticated administrators. Create the initial administrator through a trusted one-time provisioning or seed process before opening the admin dashboard; public API requests cannot bootstrap an administrator. For production, replace `PAYLOAD_SECRET`, use the MongoDB Atlas connection string and set the Cloudinary values in the deployment environment.

`npm run seed` is idempotent and creates the development categories, products, media, homepage slider and site settings without duplicating existing records.

## Storefront chatbot

`POST /api/storefront/chat` accepts a message of up to 500 characters and an optional bounded conversation history. It loads active products and site settings directly from Payload before answering. Requests are rate-limited, AI credentials remain server-side, and specific order details are never returned through public chat.

The built-in fallback handles common catalog, price, stock, delivery, payment, return, warranty, and support questions. For natural English and Roman Urdu answers, configure an OpenAI-compatible provider in `backend/.env`:

```dotenv
CHATBOT_API_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
CHATBOT_API_KEY=your-private-provider-key
CHATBOT_MODEL=your-enabled-model
```

All three values are optional, but they must be present together to enable AI responses. Never commit the real API key. Restart the backend after changing environment variables.

## Storefront checkout

`POST /api/storefront/checkout` accepts customer details, shipping address, payment method and cart lines containing `productId`, `variantCode` and `quantity`. Prices and availability are always loaded from the database; browser-supplied prices are ignored.

Online payment requests remain disabled while `PAYMENT_PROVIDER=manual`. The selected gateway adapter and webhook verification should be added after the client's gateway account is approved.

## Verification

```bash
npm run typecheck
npm run build
```
