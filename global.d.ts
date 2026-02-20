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
