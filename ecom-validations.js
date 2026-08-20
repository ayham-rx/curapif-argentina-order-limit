import * as ecomValidations from 'interfaces-ecommerce-v1-validations-provider';

const ARGENTINA_ITEM_LIMIT = 3;
const ARGENTINA_COUNTRY_CODES = ['AR', 'ARGENTINA'];

/**
 * @param {import('interfaces-ecommerce-v1-validations-provider').GetValidationViolationsOptions} options
 * @param {import('interfaces-ecommerce-v1-validations-provider').Context} context
 * @returns {Promise<import('interfaces-ecommerce-v1-validations-provider').GetValidationViolationsResponse | import('interfaces-ecommerce-v1-validations-provider').BusinessError>}
 */
export const getValidationViolations = async (options, context) => {
  const { validationInfo } = options;

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
            `Debido a los requisitos de despacho aduanero de Argentina, los pedidos enviados a Argentina están limitados a un máximo de ${ARGENTINA_ITEM_LIMIT} artículos. ` +
            `Tu pedido actualmente tiene ${totalQuantity} artículo(s) — por favor elimina ${overBy} artículo(s) para continuar.`
        }
      ]
    };
  }

  return { violations: [] };
};
