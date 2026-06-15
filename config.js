// Crave Essa QR Discount Landing Page Configuration
const CRAVE_CONFIG = {
  // Brand details
  brandName: "Crave Essa",
  instagramUsername: "@craveessa",
  instagramLink: "https://www.instagram.com/craveessa",
  whatsappNumber: "919999999999", // Replace with your actual WhatsApp business number (with country code, e.g., 91 for India)
  whatsappWelcomeMsg: "Hi Crave Essa! I filled out the discount form on your landing page. My details are below:",

  // Discount settings
  discountCodePrefix: "CRAVE50", // Prefix for the generated code, e.g., CRAVE50-X82A
  baseDiscountPercent: "50%", // Display discount text

  // Urgency Settings
  initialCustomersCount: 14, // Starts with this number and slowly ticks down or stays steady for urgency

  // Google Form integration details mapped to https://forms.gle/NrxR2bokqG2t9hqw5
  googleForm: {
    actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc6IRDMEQmqf1agNxGJpgKtgEftT-5pwWJTxwSUmj1zprdbHw/formResponse",
    
    fields: {
      fullName: "entry.1113318575",
      whatsappNumber: "entry.1882353847",
      email: "entry.1617514986",
      cakeSize: "entry.1970668983",
      flavor: "entry.873133579",
      occasion: "entry.1751733380",
      neededBy: "entry.435919100", // Format: YYYY-MM-DD
      deliveryArea: "entry.2092884814",
      instagramFollowed: "entry.1726213751",
      // Note: "Ordered from Crave Essa before?" is not present in the Google Form,
      // so it is collected on the frontend and appended to the WhatsApp order text but not posted to the Google Form.
      orderedBefore: null
    }
  }
};

// Export config if we are in a module context, otherwise attach to window
if (typeof module !== "undefined" && module.exports) {
  module.exports = CRAVE_CONFIG;
} else {
  window.CRAVE_CONFIG = CRAVE_CONFIG;
}
