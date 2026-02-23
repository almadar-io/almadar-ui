export interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}
export type FileSystemStatus = 'idle' | 'booting' | 'ready' | 'running' | 'error';
export interface FileSystemFile {
    path: string;
    content: string;
}
export interface SelectedFile {
    path: string;
    content: string;
    language?: string;
    isDirty?: boolean;
}
export interface UseFileSystemResult {
    status: FileSystemStatus;
    error: string | null;
    isLoading: boolean;
    files: FileNode[];
    selectedFile: SelectedFile | null;
    selectedPath: string | null;
    previewUrl: string | null;
    boot: () => Promise<void>;
    mountFiles: (files: FileSystemFile[] | Record<string, unknown>) => Promise<void>;
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    selectFile: (path: string) => Promise<void>;
    updateContent: (pathOrContent: string, content?: string) => void;
    updateSelectedContent: (content: string) => void;
    refreshTree: () => Promise<void>;
    runCommand: (command: string) => Promise<{
        exitCode: number;
        output: string;
    }>;
    startDevServer: () => Promise<void>;
}
export declare function useFileSystem(): UseFileSystemResult;
