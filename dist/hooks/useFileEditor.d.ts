import type { UseExtensionsResult } from './useExtensions';
import type { UseFileSystemResult } from './useFileSystem';
import type { OrbitalSchema } from '@almadar/core';
export interface OpenFile {
    path: string;
    content: string;
    isDirty: boolean;
    language?: string;
}
export interface UseFileEditorOptions {
    extensions: UseExtensionsResult;
    fileSystem: UseFileSystemResult;
    onSchemaUpdate?: (schema: OrbitalSchema) => Promise<void>;
}
export interface FileEditResult {
    success: boolean;
    action?: 'updated_schema' | 'converted_extension' | 'saved_extension' | 'saved';
    error?: string;
}
export interface UseFileEditorResult {
    openFiles: OpenFile[];
    activeFile: OpenFile | null;
    isSaving: boolean;
    openFile: (path: string) => Promise<void>;
    closeFile: (path: string) => void;
    setActiveFile: (path: string) => void;
    updateFileContent: (path: string, content: string) => void;
    handleFileEdit: (path: string, content: string) => Promise<FileEditResult>;
    saveFile: (path: string) => Promise<void>;
    saveAllFiles: () => Promise<void>;
}
export declare function useFileEditor(options: UseFileEditorOptions): UseFileEditorResult;
