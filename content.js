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
 * @typedef {import("./global.d.ts").Cache} VibeCheckCache
 * @typedef {import("./global.d.ts").SiteConfig} SiteConfig
 * @typedef {import("./global.d.ts").VibeCheckConfig} VibeCheckConfig
 */
/**
 * @param {MutationRecord[]} changes
 * @param {MutationObserver} observer
 */
function onDomChange(changes, observer) {
    const posts = Array.from(document.querySelectorAll(window.vibeCheck.siteConfig.posts.join(", ")))
    console.log(posts.map(p => p.textContent))
}

(async () => {
    const contentConfig = await getData("sites.jsonc")

    // @ts-ignore
    window.vibeCheck = {
        siteConfig: /** @type {SiteConfig} */ (getConfig(contentConfig))
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
    onDomChange([], observer)

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
