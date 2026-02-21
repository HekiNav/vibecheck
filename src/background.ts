import browser from "webextension-polyfill"



let cachedData: {[key:string]:any} = {}

async function loadData(file: string) {
    if (cachedData[file]) return cachedData[file]
    const url = browser.runtime.getURL(`src/assets/data/${file}`)
    return await (await fetch(url)).json()
}   

export interface Message<T> {
    type: T
}
export interface GetDataMessage extends Message<"getData"> {
    file: string
}
export interface VibeCheckConfig {
    siteConfig: SiteConfig
}

export interface SiteConfig {
    posts: string[],
    wait: string[],
    fields: {
        user_name: [string, ...(number|string)[]],
        user_id: [string, ...(number|string)[]],
        body: [string, ...(number|string)[]],
        extra?: [string, ...(number|string)[]]
    }
}
declare global {
    interface Window {
        vibeCheck: VibeCheckConfig;
    }
}

browser.runtime.onMessage.addListener((msg: any, _sender: any) => {
    const message = msg as GetDataMessage
    console.log(message.type)
    if (message.type === "getData") {
        return loadData(message.file);
    }
});