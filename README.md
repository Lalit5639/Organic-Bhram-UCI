# Bhram™ Honey Website — Frontend Starter

## Included
- Premium responsive homepage
- Dedicated responsive Bhram™ product page with 250 g / 500 g / 1 kg pack ordering
- Bhram™ hero product using the supplied product image
- Product sizes: 250g / 500g / 1kg
- Customer order form with delivery address, PIN/district lookup, optional current map pin, Cash on Delivery and UPI payments
- Online orders include Google Pay, PhonePe, Paytm and WhatsApp Pay UPI links, an amount-specific QR code and required payment terms acceptance
- Order details open in a prefilled WhatsApp message; online payment confirmation still requires manual verification because there is no payment backend
- Auto-playing one-by-one honey journey slider with animated step icons, pause/step controls and reduced-motion support
- Purity & lab section
- Our honey collection
- Asli vs Nakli education section
- QR code linked to the official FoSCoS FSSAI registration record
- Batch / bottle verification page (frontend demo)
- Contact enquiry form (frontend demo)
- Mobile responsive navigation
- Scroll reveal animations

## Important
The current build includes a frontend lead-capture popup connected to Google Sheets through `google-sheet-apps-script.js`. Deploy that script as a Google Apps Script web app with access set to **Anyone**, then make sure `UCI_SHEET_WEB_APP_URL` in `index.html` points to that deployment. After changing the Apps Script, deploy a new version for the protection to take effect. The script escapes formula-like user input before storing it in the sheet. The popup submits leads with a cross-origin `no-cors` request because browser security prevents GitHub Pages from reading the Apps Script response; its confirmation means the request completed, not that the sheet response was verified.

Replace demo content with the final:
- approved brand copy
- official FSSAI/certification details
- real laboratory reports
- actual apiary/source information
- live batch lookup for product-level verification
- contact details

## Run
Open `index.html` directly in a browser, or serve the folder through a local web server.

## Production next step
Connect the batch verification form to a backend/database for live product-level verification. The homepage QR currently opens the official FoSCoS FSSAI registration record.

The order form uses the Indian PIN-code API and OpenStreetMap reverse geocoding only when customers enter a full PIN code or request their current location. Customers can review the location pin in Google Maps before including it in their WhatsApp order. Online payment QR codes are generated in the browser for `bhramhoney@upi`; verify the merchant UPI ID is active before accepting payments. Online orders must be manually verified because no payment gateway or confirmation backend is connected.

Order details open as a receipt-style, prefilled WhatsApp text message with an order ID, date, item summary, COD payment and delivery sections. WhatsApp supports headings and emphasis, but the message is still text rather than a PDF attachment. The customer reviews and sends it from WhatsApp. Sending a PDF directly requires a WhatsApp Business API backend.


## Premium media + 2D manufacturing section
- Four supplied local bee videos are grouped by apiary, beekeeping, harvest and honeycomb stages.
- Each video uses native playback controls and local poster imagery.
- The new "How honey becomes a Bhram™ bottle" section is a custom inline SVG/CSS 2D animation.
- Replace the prototype media URLs with your own licensed brand photography/video before production launch.
- The 2D animation is frontend-only; it can later be upgraded to Lottie/GSAP or a custom illustrated production storyboard.
