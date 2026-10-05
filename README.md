# Bhram™ Honey Website — Frontend Starter

## Included
- Premium responsive homepage
- Bhram™ hero product using the supplied product image
- Product sizes: 250g / 500g / 1kg
- Customer order form with delivery address, PIN/district lookup, optional current map pin and Cash on Delivery
- Order details open in a prefilled WhatsApp message; no order backend or UPI payment is configured
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
The current build is a frontend prototype. Replace demo content with the final:
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

The order form uses the Indian PIN-code API and OpenStreetMap reverse geocoding only when customers enter a full PIN code or request their current location. Customers can review the location pin in Google Maps before including it in their WhatsApp order. Add a verified UPI ID before enabling UPI/QR payments.

Order details open as a receipt-style, prefilled WhatsApp text message with an order ID, date, item summary, COD payment and delivery sections. WhatsApp supports headings and emphasis, but the message is still text rather than a PDF attachment. The customer reviews and sends it from WhatsApp. Sending a PDF directly requires a WhatsApp Business API backend.


## Premium media + 2D manufacturing section
- Four supplied local bee videos are grouped by apiary, beekeeping, harvest and honeycomb stages.
- Each video uses native playback controls and local poster imagery.
- The new "How honey becomes a Bhram™ bottle" section is a custom inline SVG/CSS 2D animation.
- Replace the prototype media URLs with your own licensed brand photography/video before production launch.
- The 2D animation is frontend-only; it can later be upgraded to Lottie/GSAP or a custom illustrated production storyboard.
