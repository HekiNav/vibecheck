//@ts-check
// @ts-ignore
globalThis.browser = typeof browser !== "undefined" ? browser : chrome;
function addBanner() {
    const banner = document.createElement("div");
    banner.className = "extension-banner";
    banner.textContent = "VibeCheck loaded";
    document.body.insertBefore(banner, document.body.firstChild);
}

const observer = new MutationObserver(onDomChange);
/**
 * @typedef {import("./global.d.ts")}
 */
/**
 * @param {MutationRecord[]} changes
 * @param {MutationObserver} observer
 */
function onDomChange(changes, observer) {
    console.log(changes, window.vibeCheck)
}

(async () => {
    const contentConfig = await getData("sites.jsonc")

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })

    // @ts-ignore
    globalThis.vibecheck = {
        siteConfig: getConfig(contentConfig)
    }
    addBanner()
})()

/**
 * @param {{[key:string]:any}} config
 */
function getConfig(config) {
    const { hostname, pathname } = window.location
    console.log(hostname, pathname)
    return Object.entries(config).filter(([key]) => key == hostname || key == hostname + pathname).reduceRight((p, [k, v]) => ({ ...v, ...p }), {})
}

/**
 * @param {string} filename
 */
async function getData(filename) {
    return await browser.runtime.sendMessage({ type: "getData", file: filename })
}
