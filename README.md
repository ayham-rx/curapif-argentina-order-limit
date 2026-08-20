# CURA PIF LATAM — Argentina 3-Item Order Limit

Velo code for the CURA PIF LATAM Wix site (`curapif.com`) that blocks any order shipping to Argentina from containing more than **3 items total**. This exists because Argentine customs clearance rules cap what can pass through as a single shipment — orders over the limit get stuck in customs, so the site should never let a customer place one.

This isn't a standalone app or server — it's a **Wix eCommerce Validations service plugin**, a Velo Service Plugin (SPI) that lives inside the Wix site's own Dev Mode code. Wix calls `getValidationViolations()` every time a visitor's cart or checkout changes. If the shipping (or billing) address is Argentina and the total item quantity across all line items exceeds 3, it returns an `ERROR`-severity violation, which blocks the "Place Order" button and shows the customer why.

## Files

- `ecom-validations.js` — the validation logic (`getValidationViolations`).
- `ecom-validations.config.js` — plugin config (`getConfig`), sets `validateInCart: true` so the same check also shows a warning on the cart page, not just at checkout.

## How the check works

1. Read the destination country from `validationInfo.shippingAddress.address.country`, falling back to `validationInfo.billingInfo.address.country` if no shipping address has been entered yet.
2. Sum `quantity` across every line item in `validationInfo.lineItems`.
3. If the country is Argentina (`AR`) and the total exceeds 3, return an `ERROR` violation with a message stating the customs-clearance reason and how many items to remove.
4. Otherwise, return no violations.

## Installing this in the Wix Editor

Wix Velo service plugins are added and edited directly inside the Wix Editor's Dev Mode — they can't be deployed from outside Wix (no CLI/Git integration for this extension type as of this writing). To install:

1. Open the **CURA PIF LATAM** site in the Wix Editor.
2. Turn on **Dev Mode** if it isn't already (top toolbar).
3. Open the **Code** sidebar → **Public & Backend** → hover over **Service Plugins** → click the **+ Add** icon.
4. Choose category **eCommerce** → **Validations**.
5. Accept any terms shown, name the integration (e.g. `argentina-order-limit`, no spaces/special characters), click **Add & Edit Code**.
6. Wix generates two files: `<name>-config.js` and `<name>.js`, each with a function already stubbed in.
   - **Keep the auto-generated function name/signature as-is.** Only replace the *body* of each function with the logic from this repo's `ecom-validations.config.js` and `ecom-validations.js`. If the generated signature for `getValidationViolations` differs from `(options)` — e.g. `({ request, metadata })` — adjust the destructuring line (`const { validationInfo } = options.request;`) to match.
7. Save both files.
8. **Preview** the site and test:
   - Add 4+ items to the cart, go to checkout, set the shipping (or billing) address to Argentina → confirm a red error blocks "Place Order" with the expected message.
   - Reduce to 3 or fewer items with the same Argentina address → confirm no violation.
   - Set a non-Argentina address with 4+ items → confirm it's not blocked.
9. **Publish** the site. Service plugins only take effect after publishing (and Preview reflects saved-but-unpublished code).

## Notes

- `ARGENTINA_ITEM_LIMIT` and the country-match logic are both isolated at the top of `ecom-validations.js` if the limit or matching needs to change later.
- The country field observed in Wix eCommerce validation requests is the ISO 3166-1 alpha-2 code (`AR`); the code also matches the literal string `ARGENTINA` defensively in case a full name is ever passed instead.
