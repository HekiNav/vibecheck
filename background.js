//@ts-check
// @ts-ignore
globalThis.browser = typeof browser !== "undefined" ? browser : chrome;
/**
 * @type {{[key:string]:any}}
 */
let cachedData = {}

/**
 * 
 * @param {string} file 
 */
async function loadData(file) {
    if (cachedData[file]) return cachedData[file]
    const url = browser.runtime.getURL(`data/${file}`)
    return await (await fetch(url)).json()
}   
/**
 * @template T
 * @typedef {{type: T}} Message
 * @property {T} type
 */
/**
 * @typedef {{file: string} & Message<"getData">} GetDataMessage
 */
browser.runtime.onMessage.addListener((/** @type {GetDataMessage} */ message, /** @type {any} */ sender) => {
    if (message.type === "getData") {
        return loadData(message.file);
    }
});