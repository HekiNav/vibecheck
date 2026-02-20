export interface VibeCheckConfig {
    myString: string;
}

declare global {
    interface Window {
        vibeCheck: VibeCheckConfig;
    }
}
