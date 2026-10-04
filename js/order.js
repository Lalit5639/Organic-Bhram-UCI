const products = {
  "250g": { label: "250 g", price: 380 },
  "500g": { label: "500 g", price: 690 },
  "1kg": { label: "1 kg", price: 1350 }
};

const form = document.getElementById("order-form");
const sizeInput = document.getElementById("product-size");
const quantityInput = document.getElementById("quantity");
const totalOutput = document.getElementById("order-total");
const postalCodeInput = document.getElementById("postal-code");
const districtInput = document.getElementById("district");
const stateInput = document.getElementById("state");
const locationButton = document.getElementById("location-button");
const locationStatus = document.getElementById("location-status");
const mapLink = document.getElementById("map-link");
const coordinatesInput = document.getElementById("coordinates");
const orderStatus = document.getElementById("order-status");

const requestedSize = new URLSearchParams(window.location.search).get("size");
if (requestedSize && products[requestedSize]) sizeInput.value = requestedSize;

function updateOrderTotal() {
  const product = products[sizeInput.value];
  const quantity = Number(quantityInput.value);
  totalOutput.textContent = product && Number.isInteger(quantity) && quantity > 0
    ? `₹${(product.price * quantity).toLocaleString("en-IN")}`
    : "—";
}

sizeInput.addEventListener("change", updateOrderTotal);
quantityInput.addEventListener("input", updateOrderTotal);
updateOrderTotal();

postalCodeInput.addEventListener("input", async () => {
  const postalCode = postalCodeInput.value.trim();
  if (!/^\d{6}$/.test(postalCode)) return;

  locationStatus.textContent = "PIN code details check ho rahi hain…";
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(postalCode)}`);
    if (!response.ok) throw new Error(`PIN lookup failed with status ${response.status}`);
    const results = await response.json();
    const postOffice = results[0]?.Status === "Success" ? results[0].PostOffice?.[0] : null;
    if (!postOffice) {
      locationStatus.textContent = "Is PIN code ki details nahi mili. District aur state manually bharein.";
      return;
    }
    districtInput.value = postOffice.District || districtInput.value;
    stateInput.value = postOffice.State || stateInput.value;
    locationStatus.textContent = `PIN code mila: ${postOffice.Name}, ${postOffice.District}.`;
  } catch (error) {
    console.error("PIN code lookup failed:", error);
    locationStatus.textContent = "PIN code lookup abhi nahi ho paaya. District aur state manually bharein.";
  }
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Is browser mein location support nahi hai. Aap address manually bhar sakte hain.";
    return;
  }

  locationButton.disabled = true;
  locationStatus.textContent = "Aapki location li ja rahi hai…";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    coordinatesInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    mapLink.href = `https://www.google.com/maps?q=${latitude},${longitude}`;
    mapLink.hidden = false;
    locationStatus.textContent = "Location pin mil gaya. Address details load ho rahi hain…";

    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.search = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        addressdetails: "1"
      }).toString();
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Address lookup failed with status ${response.status}`);
      const result = await response.json();
      const address = result.address || {};
      const district = address.state_district || address.district || address.county || "";
      const postalCode = address.postcode || "";
      const locality = [
        address.house_number,
        address.road,
        address.neighbourhood || address.suburb,
        address.city || address.town || address.village
      ].filter(Boolean).join(", ");

      if (district) districtInput.value = district;
      if (address.state) stateInput.value = address.state;
      if (postalCode && /^\d{6}$/.test(postalCode)) {
        postalCodeInput.value = postalCode;
      }
      const addressInput = form.elements.address;
      if (locality && !addressInput.value.trim()) addressInput.value = locality;
      locationStatus.textContent = district || postalCode
        ? "Location mil gayi; available district, PIN aur address fill kar diye hain. Details check kar lein."
        : "Location pin mil gaya. Address details nahi mili; baaki fields manually bharein.";
    } catch (error) {
      console.error("Current location address lookup failed:", error);
      locationStatus.textContent = "Map pin mil gaya, lekin address lookup nahi hua. Baaki details manually bharein.";
    } finally {
      locationButton.disabled = false;
    }
  }, (error) => {
    const messages = {
      1: "Location permission allow karein, ya address manually bharein.",
      2: "Location nahi mil saki. Dobara koshish karein ya address manually bharein.",
      3: "Location request ka samay khatam hua. Dobara koshish karein."
    };
    locationStatus.textContent = messages[error.code] || "Location nahi mil saki. Address manually bharein.";
    locationButton.disabled = false;
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  orderStatus.textContent = "";
  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const product = products[String(formData.get("productSize"))];
  const quantity = Number(formData.get("quantity"));
  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    orderStatus.textContent = "Pack ya quantity check karein. Quantity 1 se 20 ke beech honi chahiye.";
    return;
  }

  const mapUrl = coordinatesInput.value
    ? `https://www.google.com/maps?q=${coordinatesInput.value.replace(", ", ",")}`
    : "";
  const total = product.price * quantity;
  const orderReference = `BH-${Date.now().toString(36).toUpperCase()}`;
  const orderDate = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const lines = [
    "🍯 *BHRAM™ HONEY*",
    "━━━━━━━━━━━━━━━━━━",
    "          *ORDER RECEIPT*",
    "━━━━━━━━━━━━━━━━━━",
    `*Order ID:* ${orderReference}`,
    `*Date:* ${orderDate}`,
    "",
    "🛍️ *ORDER SUMMARY*",
    "──────────────────",
    `Bhram Honey (${product.label})`,
    `Quantity: ${quantity}`,
    `Rate: ₹${product.price.toLocaleString("en-IN")}`,
    "──────────────────",
    `💰 *TOTAL: ₹${total.toLocaleString("en-IN")}*`,
    "",
    "💳 *PAYMENT*",
    "Cash on Delivery (COD)",
    "",
    "👤 *CUSTOMER*",
    `Name: ${String(formData.get("name")).trim()}`,
    `Mobile: ${String(formData.get("phone")).trim()}`,
    `Username: ${String(formData.get("username")).trim() || "Nahi diya"}`,
    "",
    "📦 *DELIVERY ADDRESS*",
    String(formData.get("address")).trim(),
    `Landmark: ${String(formData.get("landmark")).trim() || "Nahi diya"}`,
    `${String(formData.get("district")).trim()}, ${String(formData.get("state")).trim()}`,
    `PIN: ${String(formData.get("postalCode")).trim()}`
  ];
  if (mapUrl) lines.push("", `📍 *Location pin:* ${mapUrl}`);
  lines.push("", "━━━━━━━━━━━━━━━━━━", "_Dhanyavaad! Bhram™ ko chunne ke liye._");

  const whatsappUrl = `https://wa.me/919027330373?text=${encodeURIComponent(lines.join("\n"))}`;
  orderStatus.textContent = "WhatsApp par order details khul rahi hain. Message review karke Send karein.";
  window.location.assign(whatsappUrl);
});
