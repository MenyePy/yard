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
