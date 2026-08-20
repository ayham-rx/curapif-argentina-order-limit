const ARGENTINA_ITEM_LIMIT = 3;
const ARGENTINA_COUNTRY_CODES = ['AR', 'ARGENTINA'];

export function getValidationViolations(options) {
  const { validationInfo } = options.request;

  const shippingCountry = validationInfo?.shippingAddress?.address?.country;
  const billingCountry = validationInfo?.billingInfo?.address?.country;
  const country = (shippingCountry || billingCountry || '').toString().trim().toUpperCase();

  if (!ARGENTINA_COUNTRY_CODES.includes(country)) {
    return { violations: [] };
  }

  const lineItems = validationInfo?.lineItems || [];
  const totalQuantity = lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (totalQuantity > ARGENTINA_ITEM_LIMIT) {
    const overBy = totalQuantity - ARGENTINA_ITEM_LIMIT;
    return {
      violations: [
        {
          severity: 'ERROR',
          target: { other: { name: 'OTHER_DEFAULT' } },
          description:
            `Due to Argentine customs clearance requirements, orders shipped to Argentina are limited to a maximum of ${ARGENTINA_ITEM_LIMIT} items. ` +
            `Your order currently has ${totalQuantity} item(s) — please remove ${overBy} item(s) to continue.`
        }
      ]
    };
  }

  return { violations: [] };
}
