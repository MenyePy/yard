export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove any '+' or spaces
  let formatted = phone.replace(/[\s+]/g, '');
  
  // If starts with 0, replace with 265
  if (formatted.startsWith('0')) {
    formatted = '265' + formatted.substring(1);
  }
  
  return formatted;
};

export const getWhatsAppLink = (phone: string): string => {
  return `https://wa.me/${formatPhoneForWhatsApp(phone)}`;
};

export interface ProductPurchaseInfo {
  name: string;
  price: number;
  contactNumber: string;
}

export const getProductPurchaseWhatsAppLink = (product: ProductPurchaseInfo): string => {  const message = encodeURIComponent(
    `Hello! I would like to buy ${product.name} listed for MWK ${product.price.toLocaleString()} from Menye's Market.`
  );
  return `https://wa.me/${formatPhoneForWhatsApp(product.contactNumber)}?text=${message}`;
};

export const openProductPurchaseWhatsApp = (product: ProductPurchaseInfo): void => {
  const whatsappLink = getProductPurchaseWhatsAppLink(product);
  window.open(whatsappLink, '_blank');
};
