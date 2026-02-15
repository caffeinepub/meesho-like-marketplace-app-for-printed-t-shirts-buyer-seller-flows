# Specification

## Summary
**Goal:** Build a Meesho-inspired printed T‑shirt marketplace with consistent UI theme, buyer storefront + cart + checkout + order history, and a protected seller/admin dashboard backed by a single Motoko actor, using Internet Identity authentication.

**Planned changes:**
- Apply a cohesive design system (colors, typography, spacing, components) across all pages; ensure all user-facing text is English (no lorem ipsum).
- Add Internet Identity auth with clear signed-out/signed-in UI, including sign-in and sign-out controls.
- Implement buyer flow: product listing with search + filters (price range, size), product detail (images/description/sizes/colors/price), add-to-cart, and cart page with quantity updates and totals (session persistence).
- Implement checkout (no payments): collect shipping details (name/phone/address), validate required fields, confirm summary, submit to backend, and show an order confirmation page with order ID + summary.
- Add buyer order history and order detail views with order status (Placed, Confirmed, Shipped, Delivered, Cancelled).
- Implement backend data model + APIs in a single Motoko actor: product CRUD (restricted), product listing with query params, order creation independent of cart, and per-user order retrieval; persist products/orders in stable state.
- Add protected seller/admin dashboard UI for product management (create/edit/delete/list), with backend authorization preventing unauthorized access.
- Seed backend with at least 6 demo T‑shirt products (varied prices; at least 2 sizes per product) so storefront is usable immediately.
- Add required static generated images under `frontend/public/assets/generated` and reference them from the frontend as static assets.

**User-visible outcome:** Users can sign in with Internet Identity, browse and filter printed T‑shirts, view details, add items to a cart, place an order with shipping info, and view order history; authorized sellers/admins can manage the product catalog via a protected dashboard.
