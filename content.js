//@ts-check
// @ts-ignore
globalThis.browser = typeof browser !== "undefined" ? browser : chrome;
function addBanner() {
    const banner = document.createElement("div");
    banner.className = "extension-banner";
    banner.textContent = "VibeCheck loaded";
    document.body.insertBefore(banner, document.body.firstChild);
}

(async () => {
    const contentConfig = await getData("content.jsonc")
    console.log("contentconfig", contentConfig)
    addBanner()
})()

/**
 * @param {string} filename
 */
async function getData(filename) {
    return await browser.runtime.sendMessage({ type: "getData", file: filename })
}
