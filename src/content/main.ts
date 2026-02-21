import { SiteConfig } from "~/background";

// @ts-ignore
(globalThis as any).browser = typeof browser !== "undefined" ? browser : chrome;

function addBanner() {
    const banner = document.createElement("div");
    banner.className = "extension-banner";
    banner.textContent = "VibeCheck loaded";
    document.body.insertBefore(banner, document.body.firstChild);
}

const observer = new MutationObserver(onDomChange);

function onDomChange(_changes: MutationRecord[], _observer: MutationObserver) {
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
        const arr = [postData.body]
        if (postData.extra) arr.push(postData.extra)
        classify(arr).then(data => {
            console.log("analysis", data.map((e:any) => e.label), postData.user_id)
        })
    })
}

function parsePost(post: Element) {
    return (Object.fromEntries(Object.entries(window.vibeCheck.siteConfig.fields).map(([k, [selector, ...indexes]]) => {
        const element = post.querySelector(selector)
        if (!indexes || !indexes.length) return [k, element ? element.textContent : null]
        return [k, indexes.reduce(
            (prev, curr, i, a) => {
                if (!prev) return null
                const e = (() => {
                    const el = prev as Element
                    if (typeof curr == "string") return specialParse(curr, el)
                    if (curr == -1) return el.parentElement
                    return el.childNodes[curr] as Element | null
                })()
                return i == a.length - 1 ? (e && e.textContent) : e
            }, (element as string | Element | null))]
    })) as {[key in keyof typeof window.vibeCheck.siteConfig.fields]: string})
}

function specialParse(type: string, el: Element) {
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
                if (curr.textContent?.slice(0, 5) == "Quote") {
                    const quoteBody = curr.querySelector("*[data-testid='tweetText']")
                    if (quoteBody) return [...prev, quoteBody]
                }
                return prev
            }, new Array<Element>())
            return extraContent[0] || null

        default:
            console.log(`%c VibeCheck extension: No implemented specialParse handler for ${type}`, 'color: #4285f4; font-weight: bold;')
            return el
    }
}

(async () => {
    console.log("initted")
    const contentConfig = await getData("sites.jsonc")

    // @ts-ignore
    window.vibeCheck = {
        siteConfig: getConfig(contentConfig) as SiteConfig
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
    onDomChange([], observer)

    addBanner()
})()


function getConfig(config: {[key:string]:any}) {
    const { hostname, pathname } = window.location
    console.log(hostname, pathname)
    return Object.entries(config).filter(([key]) => key == hostname || key == hostname + pathname).reduceRight((p, [, v]) => ({ ...v, ...p }), {})
}

async function getData(filename: string): Promise<any> {
    //@ts-expect-error
    return await browser.runtime.sendMessage({ type: "getData", file: filename })
}
async function classify(fields: string[]): Promise<any> {
    //@ts-expect-error
    return await browser.runtime.sendMessage({ type: "classify", fields })
}
