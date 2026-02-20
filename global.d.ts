export interface VibeCheckConfig {
    siteConfig: SiteConfig
    cache: Cache
}

export interface SiteConfig {
    posts: string[]
}
export interface Cache {

}

declare global {
    interface Window {
        vibeCheck: VibeCheckConfig;
    }
}
