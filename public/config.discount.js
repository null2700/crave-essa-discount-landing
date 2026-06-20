// Craveessa discount landing configuration
const CRAVE_CONFIG = {
  brandName: "Craveessa",
  instagramUsername: "@craveessa",
  instagramLink: "https://www.instagram.com/craveessa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  whatsappNumber: "9011560339",
  whatsappWelcomeMsg: "Hi Craveessa! I have a question about ordering a cake.",
  discountCodePrefix: "CRAVE50",
  baseDiscountPercent: "50%",
  initialCustomersCount: 14,
  googleForm: {
    actionUrl: "",
    fields: {
      fullName: "",
      whatsappNumber: "",
      email: "",
      cakeSize: "",
      flavor: "",
      occasion: "",
      neededBy: "",
      deliveryArea: "",
      instagramFollowed: ""
    }
  }
  ,
  // Optional: URL to the published Google Sheet CSV (owner view)
  // Publish your Google Form's response sheet (File → Publish to web → CSV) and paste the URL here.
  ownerFeedUrl: ""
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CRAVE_CONFIG;
} else {
  window.CRAVE_CONFIG = CRAVE_CONFIG;
}
