# Specification

## Summary
**Goal:** Improve checkout data capture and discounts, make Internet Identity login reliable, and add clear buyer/seller/founder entry points plus an admin-facing deploy/publishing info option.

**Planned changes:**
- Add a required Email field to checkout with English validation; include email in order creation payload and display it in order confirmation/details.
- Add an optional promo/referral code field at checkout; if it matches the provided allowlist, apply and display a 50% discount and persist the discounted total in stored orders.
- Extend backend order model and order creation API to store buyer email and optionally accept/apply a promo code discount during order creation.
- Fix Internet Identity login/logout flow to avoid “already authenticated” error states and remove the need for manual refreshes; ensure all auth messaging is in English.
- Add separate UI entry points for Customer Login and Seller Login (both via Internet Identity) with role-based routing: sellers with admin access go to /admin; non-admins see an English access-denied path back to storefront.
- Add a Founder Login (or equivalent verification step) using the exact founder email “mercutiose369@gmail.com” to grant highest available access level within the existing role system; show clear English errors for non-matches.
- Add an admin “Deploy/Publishing” UI section that explains automatic deployment behavior and provides a browser action to access/copy the live app link (without claiming manual deploy support).

**User-visible outcome:** Buyers can checkout with email and optionally enter a promo code for 50% off; login/logout works reliably; users can choose customer vs seller login with correct routing and access handling; the founder can be recognized via the specified email to get admin-level access; admins can view a deploy/publishing info section and easily copy the live app link.
