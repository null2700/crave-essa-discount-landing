// Craveessa Luxury Cake Atelier Configuration
const CRAVE_CONFIG = {
  brandName: "Craveessa",
  instagramUsername: "@craveessa",
  instagramLink: "https://www.instagram.com/craveessa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  whatsappNumber: "9011560339",
  whatsappWelcomeMsg: "Hi Craveessa! I would like to inquire about a bespoke cake design.",
  discountCodePrefix: "CREME25",
  baseDiscountPercent: "25%",
  initialCustomersCount: 22,
  googleForm: {
    actionUrl: "",
    fields: {}
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CRAVE_CONFIG;
} else {
  window.CRAVE_CONFIG = CRAVE_CONFIG;
}

