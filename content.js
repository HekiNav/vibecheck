// Function to create and add the banner
function addBanner() {
  const banner = document.createElement("div");

  banner.className = "extension-banner";

  banner.textContent = "VibeCheck loaded";

  document.body.insertBefore(banner, document.body.firstChild);
}
addBanner()