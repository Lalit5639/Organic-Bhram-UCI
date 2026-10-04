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

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const character of word) {
      const next = line + character;
      if (context.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = character;
      } else {
        line = next;
      }
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function makePdfBlob(jpegBytes, imageWidth, imageHeight) {
  const encoder = new TextEncoder();
  const chunks = [];
  let length = 0;
  const offsets = [0];
  const append = (chunk) => {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  };

  append("%PDF-1.4\n%FFFF\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Receipt 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"
  ];
  for (const object of objects) {
    offsets.push(length);
    append(object);
  }

  offsets.push(length);
  append(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  append(jpegBytes);
  append("\nendstream\nendobj\n");

  const content = "q\n595 0 0 842 0 0 cm\n/Receipt Do\nQ\n";
  offsets.push(length);
  append(`5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  const xrefOffset = length;
  append(`xref\n0 6\n0000000000 65535 f \n`);
  for (let index = 1; index <= 5; index += 1) {
    append(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return new Blob(chunks, { type: "application/pdf" });
}

function createOrderReceipt(formData, product, quantity, total, mapUrl) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Receipt canvas is not available in this browser.");

  const left = 96;
  const right = canvas.width - left;
  let y = 0;
  context.fillStyle = "#fffefa";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#263d32";
  context.fillRect(0, 0, canvas.width, 240);
  context.fillStyle = "#e7d4a6";
  context.font = '600 26px "DM Sans", "Noto Sans Devanagari", sans-serif';
  context.fillText("BHRAM HONEY", left, 78);
  context.fillStyle = "#ffffff";
  context.font = '700 50px "DM Sans", "Noto Sans Devanagari", sans-serif';
  context.fillText("ORDER RECEIPT", left, 158);
  context.fillStyle = "#d9e2d1";
  context.font = '24px "DM Sans", "Noto Sans Devanagari", sans-serif';
  context.fillText("Cash on Delivery", left, 205);
  y = 308;

  const drawSection = (title) => {
    context.fillStyle = "#405c47";
    context.font = '700 27px "DM Sans", "Noto Sans Devanagari", sans-serif';
    context.fillText(title, left, y);
    y += 20;
    context.strokeStyle = "#dfe4d9";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();
    y += 38;
  };

  const drawField = (label, value) => {
    context.fillStyle = "#737b6d";
    context.font = '600 19px "DM Sans", "Noto Sans Devanagari", sans-serif';
    context.fillText(label.toUpperCase(), left, y);
    y += 31;
    context.fillStyle = "#263d32";
    context.font = '24px "DM Sans", "Noto Sans Devanagari", sans-serif';
    const lines = wrapCanvasText(context, value || "Not provided", right - left);
    for (const line of lines) {
      if (y > canvas.height - 100) throw new Error("Receipt is too long to fit on one page.");
      context.fillText(line, left, y);
      y += 32;
    }
    y += 19;
  };

  drawSection("ORDER DETAILS");
  drawField("Receipt date", new Date().toLocaleString("en-IN"));
  drawField("Product", `${product.label} x ${quantity}`);
  drawField("Payment method", "Cash on Delivery");
  context.fillStyle = "#edf0e5";
  context.fillRect(left, y - 3, right - left, 76);
  context.fillStyle = "#263d32";
  context.font = '600 22px "DM Sans", "Noto Sans Devanagari", sans-serif';
  context.fillText("TOTAL TO COLLECT", left + 20, y + 27);
  context.font = '700 31px "DM Sans", "Noto Sans Devanagari", sans-serif';
  context.textAlign = "right";
  context.fillText(`Rs. ${total.toLocaleString("en-IN")}`, right - 20, y + 30);
  context.textAlign = "left";
  y += 115;

  drawSection("CUSTOMER & DELIVERY");
  drawField("Name", String(formData.get("name")).trim());
  drawField("Mobile", String(formData.get("phone")).trim());
  drawField("Username", String(formData.get("username")).trim() || "Not provided");
  drawField("Address", String(formData.get("address")).trim());
  drawField("Landmark", String(formData.get("landmark")).trim() || "Not provided");
  drawField("PIN code / District / State", [
    String(formData.get("postalCode")).trim(),
    String(formData.get("district")).trim(),
    String(formData.get("state")).trim()
  ].join(" / "));
  if (mapUrl) {
    drawField("Current location pin", String(formData.get("coordinates")).trim());
    drawField("Google Maps", mapUrl);
  }

  context.fillStyle = "#737b6d";
  context.font = '18px "DM Sans", "Noto Sans Devanagari", sans-serif';
  context.fillText("Thank you for choosing Bhram Honey.", left, canvas.height - 54);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const jpegBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), character => character.charCodeAt(0));
  return makePdfBlob(jpegBytes, canvas.width, canvas.height);
}

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
  let receipt;
  try {
    receipt = createOrderReceipt(formData, product, quantity, total, mapUrl);
  } catch (error) {
    console.error("Order receipt generation failed:", error);
    orderStatus.textContent = "PDF receipt nahi ban saki. Kripya dobara koshish karein.";
    return;
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  const file = new File([receipt], `Bhram-order-${dateStamp}.pdf`, { type: "application/pdf" });
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
    orderStatus.textContent = "Is browser mein PDF ko seedha share karna supported nahi hai. Mobile par HTTPS website ko kholkar dobara koshish karein.";
    return;
  }

  orderStatus.textContent = "Share menu khul raha hai. WhatsApp chunein, phir owner ka chat select karke Send karein.";
  navigator.share({
    files: [file],
    title: "Bhram Honey order receipt",
    text: "Namaste, Bhram Honey order ki PDF receipt attached hai."
  }).then(() => {
    orderStatus.textContent = "Share menu se receipt bhejne ke liye WhatsApp aur owner ka chat chunein.";
  }).catch((error) => {
    if (error.name === "AbortError") {
      orderStatus.textContent = "PDF share cancel ho gaya. Dobara try karne ke liye button dabayein.";
      return;
    }
    console.error("Order receipt share failed:", error);
    orderStatus.textContent = "PDF share nahi ho paayi. Mobile par HTTPS website se dobara koshish karein.";
  });
});
