function detectDevice() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  let brand = "Unknown Brand";
  let type = "Unknown Device";
  let os = "Unknown OS";

  if (/android/i.test(ua)) {
    os = "Android";
    type = /mobile/i.test(ua) ? "Phone" : "Tablet";
    if (/SM-|Samsung/i.test(ua)) brand = "Samsung";
    else if (/Pixel/i.test(ua)) brand = "Google Pixel";
    else if (/HUAWEI/i.test(ua)) brand = "Huawei";
    else brand = "Android Device";
  } else if (/iPad|iPhone|iPod/.test(ua)) {
    os = "iOS";
    type = /iPad/.test(ua) ? "Tablet" : "Phone";
    brand = "Apple";
  }

  const info = `Device: ${type}\nOS: ${os}\nBrand: ${brand}`;
  const infoBox = document.getElementById("device-info");

  // Show or update the info
  infoBox.innerText = info;
  infoBox.style.display = "block";
}
// Detect device and show info
function showDeviceInfo() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  let brand = "Unknown Brand";
  let type = "Unknown Device";
  let os = "Unknown OS";

  if (/android/i.test(ua)) {
    os = "Android";
    type = /mobile/i.test(ua) ? "Phone" : "Tablet";
    if (/SM-|Samsung/i.test(ua)) brand = "Samsung";
    else if (/Pixel/i.test(ua)) brand = "Google Pixel";
    else if (/HUAWEI/i.test(ua)) brand = "Huawei";
    else brand = "Android Device";
  } else if (/iPad|iPhone|iPod/.test(ua)) {
    os = "iOS";
    type = /iPad/.test(ua) ? "Tablet" : "Phone";
    brand = "Apple";
  }

  const infoBox = document.getElementById("device-info");
  infoBox.innerText = `Device: ${type}\nOS: ${os}\nBrand: ${brand}`;
  infoBox.style.display = "block";
}

// Hide on scroll
window.addEventListener('scroll', () => {
  const infoBox = document.getElementById("device-info");
  infoBox.style.display = "none";
});
