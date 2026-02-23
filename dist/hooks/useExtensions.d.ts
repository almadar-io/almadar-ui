export interface Extension {
    id: string;
    name: string;
    language?: string;
    loaded: boolean;
}
export interface ExtensionEntry {
    file: string;
    language?: string;
}
export interface ExtensionManifest {
    languages: Record<string, {
        extensions: string[];
        icon?: string;
        color?: string;
    }>;
    extensions: ExtensionEntry[];
}
export interface UseExtensionsOptions {
    appId: string;
    loadOnMount?: boolean;
}
export interface UseExtensionsResult {
    extensions: Extension[];
    manifest: ExtensionManifest;
    isLoading: boolean;
    error: string | null;
    loadExtension: (extensionId: string) => Promise<void>;
    loadExtensions: () => Promise<void>;
    getExtensionForFile: (filename: string) => Extension | null;
}
export declare function useExtensions(options: UseExtensionsOptions): UseExtensionsResult;
