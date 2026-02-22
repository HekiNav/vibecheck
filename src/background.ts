import browser from "webextension-polyfill"
import { env, pipeline, ProgressCallback } from "@huggingface/transformers"

// configure transformers.js to use local WASM and models
// models are local because they need conversion to onnx, only some models support it out of the box
// wasm is downloaded from huggingface.co by default, but blocked by the browser
env.useBrowserCache = true
env.allowRemoteModels = false
env.allowLocalModels = true
env.localModelPath = "/models/"
if (env.backends.onnx.wasm) env.backends.onnx.wasm.wasmPaths = "/onnx-wasm/"

declare global {
    interface Window {
        vibeCheck: VibeCheckConfig;
    }
}
// example from transformers.js (model is initialized only on demand)
class Singleton {
    static fn: (...args: any[]) => Promise<any>
    static instance: any
    static promise_chain: any
    static async getInstance(progress_callback: ProgressCallback) {
        return (this.fn ??= async (...args) => {
            this.instance ??= pipeline(
                "text-classification",
                "SamLowe/roberta-base-go_emotions-onnx",
                {
                    progress_callback,
                    device: "wasm",
                },
            );

            return (this.promise_chain = (
                this.promise_chain ?? Promise.resolve()
            ).then(async () => (await this.instance)(...args)));
        });
    }
}

async function classify(...texts: string[]) {
    const classifier = await Singleton.getInstance((data) => {
        console.log(data)
    });

    const result = await classifier(texts);
    return result;
};

// cache config files if requested multiple times in short period of time
let cachedData: { [key: string]: any } = {}

async function loadData(file: string) {
    if (cachedData[file]) return cachedData[file]
    const url = browser.runtime.getURL(`src/assets/data/${file}`)
    return await (await fetch(url)).json()
}


export interface VibeCheckConfig {
    siteConfig: SiteConfig
}

export interface SiteConfig {
    posts: string[],
    wait: string[],
    fields: {
        user_name: [string, ...(number | string)[]],
        user_id: [string, ...(number | string)[]],
        body: [string, ...(number | string)[]],
        extra?: [string, ...(number | string)[]]
    }
}

export interface Message<T> {
    type: T
}
export interface GetDataMessage extends Message<"getData"> {
    file: string
}
export interface ClassifyMessage extends Message<"classify"> {
    fields: string[]
}

browser.runtime.onMessage.addListener((msg: any, _sender: any) => {
    const message = msg as GetDataMessage | ClassifyMessage
    console.log(message.type)
    if (message.type === "getData") {
        return loadData(message.file);
    }
    if (message.type === "classify") {
        return classify(...message.fields)
    }
});