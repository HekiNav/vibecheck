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
 * @typedef {import("./global.d.ts").SiteConfig} SiteConfig
 * @typedef {import("./global.d.ts").VibeCheckConfig} VibeCheckConfig
 */
/**
 * @param {MutationRecord[]} changes
 * @param {MutationObserver} observer
 */
function onDomChange(changes, observer) {
    const posts = Array.from(document.querySelectorAll(window.vibeCheck.siteConfig.posts.join(", ")))
    posts.forEach(p => {
        // if already checked or ignoring for now (wait for load), return
        if (
            p.hasAttribute("data-vibecheck-id") ||
            (
                window.vibeCheck.siteConfig.wait &&
                p.querySelectorAll(window.vibeCheck.siteConfig.wait.join(", ")).length
            )
        ) return
        p.setAttribute("data-vibecheck-id", crypto.randomUUID())
        const postData = parsePost(p)
        console.log(postData)
    })
}
/**
 * 
 * @param {Element} post 
 */
function parsePost(post) {
    return /** @type {{[key in keyof typeof window.vibeCheck.siteConfig.fields]: any}} */ (Object.fromEntries(Object.entries(window.vibeCheck.siteConfig.fields).map(([k, [selector, ...indexes]]) => {
        const element = post.querySelector(selector)
        if (!indexes || !indexes.length) return [k, element ? element.textContent : null]
        return [k, indexes.reduce(
            (prev, curr, i, a) => {
                if (!prev) return null
                const e = (() => {
                    const el = /** @type {Element} */ (prev)
                    if (typeof curr == "string") return specialParse(curr, el)
                    if (curr == -1) return el.parentElement
                    return /** @type {Element | null} */ (el.childNodes[curr])
                })()
                return i == a.length - 1 ? (e && e.textContent) : e
            }, /** @type {string | Element | null} */(element))]
    })))
}
/**
 * 
 * @param {string} type 
 * @param {Element} el 
 */
function specialParse(type, el) {
    switch (type) {
        // parse quotes and other attached things
        case "extra/x.com":
            const childArray = Array.from(el.children)
            const extras = childArray.slice(2, childArray.length - 1)
            const extraContent = extras.reduce((prev, curr) => {
                // cards
                const card = curr.querySelector(`div[data-testid]`)
                if (card && card.textContent) return [...prev, card]
                // quotes
                console.log(curr.textContent.slice(0, 5))
                if (curr.textContent.slice(0, 5) == "Quote") {
                    const quoteBody = curr.querySelector("*[data-testid='tweetText']")
                    if (quoteBody) return [...prev, quoteBody]
                }
                return prev
            }, /** @type {(Element)[]} */([]))
            return extraContent[0] || null

        default:
            console.warn(`%c VibeCheck extension: No implemented specialParse handler for ${type}`, 'color: #4285f4; font-weight: bold;')
            return el
    }
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
