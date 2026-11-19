# NH EV Trader Admin Guide

Open `http://localhost:3001/admin` and sign in with a staff account.

## Catalog

- **Categories:** Create or reorder Vehicles, Chargers and Accessories.
- **Products:** Manage title, slug, SKU, price, images, specifications, variants and stock.
- **Inventory Logs:** Review stock reductions from orders and manual corrections.
- Publish a product before expecting it on the storefront. Archived products are hidden.

## Sales

- **Orders:** Review customer, items, delivery address, payment state and fulfilment state.
- Move orders through pending, confirmed, processing, shipped and delivered.
- **Customers:** Review registered customer contact information and saved addresses.
- **Inquiries:** Review contact-form messages and mark them contacted or closed.

## Website content

- **Banners:** Edit homepage slider imagery, copy, links and order.
- **Homepage:** Select active hero banners and featured products.
- **Site Settings:** Manage support email, phone, address and delivery thresholds.
- **Media:** Upload product and banner images. Cloudinary is used automatically when its environment credentials are configured.

## Staff access

- Administrators can create/delete staff accounts and change roles.
- Store managers can manage catalog, content, customers and orders.
- Never share staff passwords or reuse the development `PAYLOAD_SECRET` in production.

## Routine workflow

1. Confirm inventory before publishing a product.
2. Review new orders and inquiries daily.
3. Confirm COD orders before dispatch.
4. Update fulfilment status so the customer account remains accurate.
5. Archive discontinued products instead of deleting order history.

