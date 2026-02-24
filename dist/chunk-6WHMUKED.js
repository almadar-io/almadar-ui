import { apiClient } from './chunk-XSEDIUM6.js';
import { subscribe, getSnapshot, clearEntities, removeEntity, updateSingleton, updateEntity, spawnEntity, getSingleton, getAllEntities, getByType, getEntity } from './chunk-N7MVUW4R.js';
import { SelectionContext, entityDataKeys, useEntityList } from './chunk-PE2H3NAW.js';
import { useEventBus } from './chunk-YXZM3WCF.js';
import { useCallback, useState, useEffect, useMemo, useContext, useSyncExternalStore } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';

function useOrbitalHistory(options) {
  const { appId, authToken, userId, onHistoryChange, onRevertSuccess } = options;
  const getHeaders = useCallback(() => {
    const headers = {
      "Content-Type": "application/json"
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    if (userId) {
      headers["x-user-id"] = userId;
    }
    return headers;
  }, [authToken, userId]);
  const [timeline, setTimeline] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    if (!appId) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = getHeaders();
      const [changesetsRes, snapshotsRes] = await Promise.all([
        fetch(`/api/graphs/${appId}/history/changesets`, { headers }),
        fetch(`/api/graphs/${appId}/history/snapshots`, { headers })
      ]);
      if (!changesetsRes.ok) {
        throw new Error(`Failed to fetch changesets: ${changesetsRes.status}`);
      }
      if (!snapshotsRes.ok) {
        throw new Error(`Failed to fetch snapshots: ${snapshotsRes.status}`);
      }
      const changesetsData = await changesetsRes.json();
      const snapshotsData = await snapshotsRes.json();
      const changesetItems = (changesetsData.changesets || []).map((cs) => ({
        id: cs.id,
        type: "changeset",
        version: cs.version,
        timestamp: cs.timestamp,
        description: `Version ${cs.version}`,
        source: cs.source,
        summary: cs.summary
      }));
      const snapshotItems = (snapshotsData.snapshots || []).map((snap) => ({
        id: snap.id,
        type: "snapshot",
        version: snap.version,
        timestamp: snap.timestamp,
        description: snap.reason || `Snapshot v${snap.version}`,
        reason: snap.reason
      }));
      const mergedTimeline = [...changesetItems, ...snapshotItems].sort(
        (a, b) => b.timestamp - a.timestamp
      );
      setTimeline(mergedTimeline);
      if (mergedTimeline.length > 0) {
        setCurrentVersion(mergedTimeline[0].version);
      }
    } catch (err) {
      console.error("[useOrbitalHistory] Failed to load history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [appId, getHeaders]);
  const revertToSnapshot = useCallback(async (snapshotId) => {
    if (!appId) {
      return { success: false, error: "No app ID provided" };
    }
    try {
      const response = await fetch(`/api/graphs/${appId}/history/revert/${snapshotId}`, {
        method: "POST",
        headers: getHeaders()
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to revert: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.schema) {
        await refresh();
        onRevertSuccess?.(data.schema);
        return {
          success: true,
          restoredSchema: data.schema
        };
      }
      return {
        success: false,
        error: data.error || "Unknown error during revert"
      };
    } catch (err) {
      console.error("[useOrbitalHistory] Failed to revert:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to revert"
      };
    }
  }, [appId, getHeaders, refresh, onRevertSuccess]);
  useEffect(() => {
    if (appId && authToken && userId) {
      refresh();
    }
  }, [appId, authToken, userId]);
  useEffect(() => {
    onHistoryChange?.(timeline);
  }, [timeline]);
  return {
    timeline,
    currentVersion,
    isLoading,
    error,
    revertToSnapshot,
    refresh
  };
}
function useFileSystem() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileContents, setFileContents] = useState(/* @__PURE__ */ new Map());
  const boot = useCallback(async () => {
    setStatus("booting");
    setError(null);
    setIsLoading(true);
    try {
      console.log("[useFileSystem] Booting WebContainer...");
      await new Promise((resolve) => setTimeout(resolve, 100));
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to boot");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const mountFiles = useCallback(async (filesToMount) => {
    setIsLoading(true);
    try {
      let filesArray;
      if (Array.isArray(filesToMount)) {
        filesArray = filesToMount;
      } else {
        filesArray = [];
        const flattenTree = (obj, basePath = "") => {
          for (const [key, value] of Object.entries(obj)) {
            const path = basePath ? `${basePath}/${key}` : key;
            if (value && typeof value === "object" && "file" in value) {
              const fileObj = value;
              filesArray.push({ path, content: fileObj.file.contents || "" });
            } else if (value && typeof value === "object" && "directory" in value) {
              const dirObj = value;
              flattenTree(dirObj.directory, path);
            }
          }
        };
        flattenTree(filesToMount);
      }
      const newContents = /* @__PURE__ */ new Map();
      for (const file of filesArray) {
        newContents.set(file.path, file.content);
      }
      setFileContents(newContents);
      const newTree = [];
      for (const file of filesArray) {
        const parts = file.path.split("/").filter(Boolean);
        let current = newTree;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isFile = i === parts.length - 1;
          const currentPath = "/" + parts.slice(0, i + 1).join("/");
          let node = current.find((n) => n.name === part);
          if (!node) {
            node = {
              path: currentPath,
              name: part,
              type: isFile ? "file" : "directory",
              children: isFile ? void 0 : []
            };
            current.push(node);
          }
          if (!isFile && node && node.children) {
            current = node.children;
          }
        }
      }
      setFiles(newTree);
      setStatus("running");
    } catch (err) {
      console.error("[useFileSystem] Failed to mount files:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const readFile = useCallback(async (path) => {
    return fileContents.get(path) || "";
  }, [fileContents]);
  const writeFile = useCallback(async (path, content) => {
    setFileContents((prev) => {
      const next = new Map(prev);
      next.set(path, content);
      return next;
    });
  }, []);
  const selectFile = useCallback(async (path) => {
    const content = fileContents.get(path) || "";
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const languageMap = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      md: "markdown",
      css: "css",
      html: "html",
      orb: "json"
    };
    setSelectedPath(path);
    setSelectedFile({
      path,
      content,
      language: languageMap[ext] || "plaintext",
      isDirty: false
    });
  }, [fileContents]);
  const updateContent = useCallback((pathOrContent, contentArg) => {
    const path = contentArg !== void 0 ? pathOrContent : selectedPath;
    const content = contentArg !== void 0 ? contentArg : pathOrContent;
    if (!path) {
      console.warn("[useFileSystem] updateContent called without path and no file selected");
      return;
    }
    setFileContents((prev) => {
      const next = new Map(prev);
      next.set(path, content);
      return next;
    });
    if (selectedPath === path) {
      setSelectedFile((prev) => prev ? { ...prev, content, isDirty: true } : null);
    }
  }, [selectedPath]);
  const updateSelectedContent = useCallback((content) => {
    setSelectedFile((prev) => prev ? { ...prev, content, isDirty: true } : null);
  }, []);
  const refreshTree = useCallback(async () => {
    console.log("[useFileSystem] Refreshing tree");
  }, []);
  const runCommand = useCallback(async (command) => {
    console.log("[useFileSystem] Running command:", command);
    return { exitCode: 0, output: "" };
  }, []);
  const startDevServer = useCallback(async () => {
    console.log("[useFileSystem] Starting dev server");
    setPreviewUrl("http://localhost:5173");
  }, []);
  return {
    status,
    error,
    isLoading,
    files,
    selectedFile,
    selectedPath,
    previewUrl,
    boot,
    mountFiles,
    readFile,
    writeFile,
    selectFile,
    updateContent,
    updateSelectedContent,
    refreshTree,
    runCommand,
    startDevServer
  };
}
var defaultManifest = {
  languages: {
    typescript: { extensions: [".ts", ".tsx"], icon: "ts", color: "#3178c6" },
    javascript: { extensions: [".js", ".jsx"], icon: "js", color: "#f7df1e" },
    json: { extensions: [".json", ".orb"], icon: "json", color: "#000000" },
    css: { extensions: [".css"], icon: "css", color: "#264de4" },
    html: { extensions: [".html"], icon: "html", color: "#e34c26" },
    markdown: { extensions: [".md", ".mdx"], icon: "md", color: "#083fa1" }
  },
  extensions: []
};
function useExtensions(options) {
  const { appId, loadOnMount = true } = options;
  const [extensions, setExtensions] = useState([]);
  const [manifest] = useState(defaultManifest);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadExtension = useCallback(async (extensionId) => {
    console.log("[useExtensions] Loading extension:", extensionId);
  }, []);
  const loadExtensions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const defaultExtensions = [
        { id: "typescript", name: "TypeScript", language: "typescript", loaded: true },
        { id: "javascript", name: "JavaScript", language: "javascript", loaded: true },
        { id: "json", name: "JSON", language: "json", loaded: true },
        { id: "css", name: "CSS", language: "css", loaded: true },
        { id: "html", name: "HTML", language: "html", loaded: true },
        { id: "markdown", name: "Markdown", language: "markdown", loaded: true }
      ];
      setExtensions(defaultExtensions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load extensions");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const getExtensionForFile = useCallback((filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext) return null;
    const languageMap = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      md: "markdown",
      css: "css",
      html: "html",
      orb: "json"
    };
    const language = languageMap[ext];
    if (!language) return null;
    return extensions.find((e) => e.language === language) || null;
  }, [extensions]);
  useEffect(() => {
    if (!appId || !loadOnMount) return;
    const loadExtensions2 = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const defaultExtensions = [
          { id: "typescript", name: "TypeScript", language: "typescript", loaded: true },
          { id: "javascript", name: "JavaScript", language: "javascript", loaded: true },
          { id: "json", name: "JSON", language: "json", loaded: true },
          { id: "css", name: "CSS", language: "css", loaded: true },
          { id: "html", name: "HTML", language: "html", loaded: true },
          { id: "markdown", name: "Markdown", language: "markdown", loaded: true }
        ];
        setExtensions(defaultExtensions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load extensions");
      } finally {
        setIsLoading(false);
      }
    };
    loadExtensions2();
  }, [appId, loadOnMount]);
  return {
    extensions,
    manifest,
    isLoading,
    error,
    loadExtension,
    loadExtensions,
    getExtensionForFile
  };
}
function useFileEditor(options) {
  const { extensions, fileSystem, onSchemaUpdate } = options;
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const activeFile = openFiles.find((f) => f.path === activeFilePath) || null;
  const openFile = useCallback(async (path) => {
    const existing = openFiles.find((f) => f.path === path);
    if (existing) {
      setActiveFilePath(path);
      return;
    }
    try {
      const content = await fileSystem.readFile(path);
      const ext = extensions.getExtensionForFile(path);
      const newFile = {
        path,
        content,
        isDirty: false,
        language: ext?.language
      };
      setOpenFiles((prev) => [...prev, newFile]);
      setActiveFilePath(path);
    } catch (err) {
      console.error("[useFileEditor] Failed to open file:", err);
    }
  }, [openFiles, fileSystem, extensions]);
  const closeFile = useCallback((path) => {
    setOpenFiles((prev) => prev.filter((f) => f.path !== path));
    if (activeFilePath === path) {
      const remaining = openFiles.filter((f) => f.path !== path);
      setActiveFilePath(remaining.length > 0 ? remaining[0].path : null);
    }
  }, [activeFilePath, openFiles]);
  const setActiveFile = useCallback((path) => {
    setActiveFilePath(path);
  }, []);
  const updateFileContent = useCallback((path, content) => {
    setOpenFiles(
      (prev) => prev.map(
        (f) => f.path === path ? { ...f, content, isDirty: true } : f
      )
    );
  }, []);
  const handleFileEdit = useCallback(async (path, content) => {
    try {
      await fileSystem.writeFile(path, content);
      let action = "saved";
      if (path.endsWith(".orb") || path.endsWith("schema.json")) {
        try {
          const schema = JSON.parse(content);
          await onSchemaUpdate?.(schema);
          action = "updated_schema";
        } catch {
        }
      } else if (path.includes("/extensions/")) {
        action = path.endsWith(".new") ? "converted_extension" : "saved_extension";
      }
      return { success: true, action };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save file"
      };
    }
  }, [fileSystem, onSchemaUpdate]);
  const saveFile = useCallback(async (path) => {
    const file = openFiles.find((f) => f.path === path);
    if (!file) return;
    setIsSaving(true);
    try {
      await fileSystem.writeFile(path, file.content);
      setOpenFiles(
        (prev) => prev.map(
          (f) => f.path === path ? { ...f, isDirty: false } : f
        )
      );
      if (path.endsWith(".orb") || path.endsWith("schema.json")) {
        try {
          const schema = JSON.parse(file.content);
          await onSchemaUpdate?.(schema);
        } catch {
        }
      }
    } catch (err) {
      console.error("[useFileEditor] Failed to save file:", err);
    } finally {
      setIsSaving(false);
    }
  }, [openFiles, fileSystem, onSchemaUpdate]);
  const saveAllFiles = useCallback(async () => {
    setIsSaving(true);
    try {
      const dirtyFiles = openFiles.filter((f) => f.isDirty);
      for (const file of dirtyFiles) {
        await saveFile(file.path);
      }
    } finally {
      setIsSaving(false);
    }
  }, [openFiles, saveFile]);
  return {
    openFiles,
    activeFile,
    isSaving,
    openFile,
    closeFile,
    setActiveFile,
    updateFileContent,
    handleFileEdit,
    saveFile,
    saveAllFiles
  };
}
function useCompile() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [stage, setStage] = useState("idle");
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const compileSchema = useCallback(async (schema) => {
    setIsCompiling(true);
    setStage("compiling");
    setError(null);
    try {
      console.log("[useCompile] Compiling schema:", schema.name);
      const result = {
        success: true,
        files: []
      };
      setLastResult(result);
      setStage("done");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Compilation failed";
      setError(errorMessage);
      setStage("error");
      setLastResult({ success: false, errors: [errorMessage] });
      return null;
    } finally {
      setIsCompiling(false);
    }
  }, []);
  return {
    isCompiling,
    stage,
    lastResult,
    error,
    compileSchema
  };
}
function usePreview(options) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(!!options?.appId);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [app, setApp] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExecutingEvent, setIsExecutingEvent] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [currentStateName, setCurrentStateName] = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const notifications = useMemo(() => ({
    notifications: notificationsList,
    isPanelOpen,
    closePanel: () => setIsPanelOpen(false),
    dismissNotification: (id) => {
      setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    },
    markAsRead: (id) => {
      setNotificationsList(
        (prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)
      );
    },
    clearAll: () => setNotificationsList([])
  }), [notificationsList, isPanelOpen]);
  useEffect(() => {
    const appId = options?.appId;
    if (!appId) {
      setApp(null);
      setIsLoading(false);
      return;
    }
    console.log("[usePreview] Setting up preview for app:", appId);
    setPreviewUrl(`/api/orbitals/${appId}`);
    setIsLoading(false);
  }, [options?.appId]);
  const startPreview = useCallback(async () => {
    console.log("[usePreview] startPreview called");
  }, []);
  const stopPreview = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("[usePreview] Stopping preview server...");
      setPreviewUrl(null);
      setApp(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    if (!previewUrl) return;
    console.log("[usePreview] Refreshing preview...");
    setPreviewUrl(`${previewUrl.split("?")[0]}?t=${Date.now()}`);
  }, [previewUrl]);
  const handleRefresh = useCallback(async () => {
    console.log("[usePreview] Handle refresh...");
    await refresh();
  }, [refresh]);
  const handleReset = useCallback(async () => {
    console.log("[usePreview] Resetting preview...");
    setError(null);
    setLoadError(null);
    setErrorToast(null);
    setIsExecutingEvent(false);
    setCurrentStateName(null);
  }, []);
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);
  const dismissErrorToast = useCallback(() => {
    setErrorToast(null);
  }, []);
  return {
    previewUrl,
    isLoading,
    error,
    loadError,
    app,
    isFullscreen,
    isExecutingEvent,
    errorToast,
    currentStateName,
    notifications,
    startPreview,
    stopPreview,
    refresh,
    handleRefresh,
    handleReset,
    toggleFullscreen,
    setErrorToast,
    dismissErrorToast
  };
}
function useAgentChat(options) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [activities, setActivities] = useState([]);
  const [todos, setTodos] = useState([]);
  const [schemaDiffs, setSchemaDiffs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threadId] = useState(null);
  const [interrupt, setInterrupt] = useState(null);
  const sendMessage = useCallback(async (content) => {
    setIsLoading(true);
    setStatus("running");
    setError(null);
    try {
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, userMessage]);
      console.log("[useAgentChat] Sending message:", content);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Agent chat is not yet implemented.",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStatus("idle");
      options?.onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  const startGeneration = useCallback(async (skill, prompt, genOptions) => {
    setStatus("running");
    setIsLoading(true);
    setError(null);
    const skillName = Array.isArray(skill) ? skill[0] : skill;
    try {
      console.log("[useAgentChat] Starting generation:", skillName, prompt, genOptions);
      await new Promise((resolve) => setTimeout(resolve, 100));
      setStatus("complete");
      options?.onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  const continueConversation = useCallback(async (message) => {
    console.log("[useAgentChat] Continue conversation", message);
  }, []);
  const resumeWithDecision = useCallback(async (decisions) => {
    console.log("[useAgentChat] Resume with decision:", decisions);
    setInterrupt(null);
  }, []);
  const cancel = useCallback(() => {
    setStatus("idle");
    setIsLoading(false);
    setInterrupt(null);
  }, []);
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  const clearHistory = useCallback(() => {
    setMessages([]);
    setActivities([]);
    setTodos([]);
    setSchemaDiffs([]);
    setError(null);
  }, []);
  return {
    messages,
    status,
    activities,
    todos,
    schemaDiffs,
    isLoading,
    error,
    threadId,
    interrupt,
    sendMessage,
    startGeneration,
    continueConversation,
    resumeWithDecision,
    cancel,
    clearMessages,
    clearHistory
  };
}
function useValidation() {
  const [result, setResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("idle");
  const [isFixing, setIsFixing] = useState(false);
  const [progressMessage, setProgressMessage] = useState(null);
  const validate = useCallback(async (appId) => {
    setIsValidating(true);
    setError(null);
    setStage("validating");
    setProgressMessage("Validating schema...");
    try {
      console.log("[useValidation] Validating app:", appId);
      const validationResult = {
        valid: true,
        errors: [],
        warnings: []
      };
      setResult(validationResult);
      setStage("complete");
      setProgressMessage(null);
      return validationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Validation failed";
      setError(errorMessage);
      const failedResult = {
        valid: false,
        errors: [{ code: "VALIDATION_ERROR", message: errorMessage, severity: "error" }],
        warnings: []
      };
      setResult(failedResult);
      setStage("complete");
      setProgressMessage(null);
      return failedResult;
    } finally {
      setIsValidating(false);
    }
  }, []);
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setStage("idle");
    setIsFixing(false);
    setProgressMessage(null);
    setIsValidating(false);
  }, []);
  return {
    result,
    isValidating,
    error,
    stage,
    isFixing,
    progressMessage,
    errors: result?.errors ?? [],
    warnings: result?.warnings ?? [],
    isValid: result?.valid ?? false,
    validate,
    clearResult,
    reset
  };
}
function useDeepAgentGeneration() {
  const [requests, setRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState({ stage: "idle", percent: 0, message: "" });
  const [error, setError] = useState(null);
  const [interrupt, setInterrupt] = useState(null);
  const generate = useCallback(async (prompt) => {
    setIsGenerating(true);
    setIsLoading(true);
    setIsComplete(false);
    setError(null);
    setProgress({ stage: "starting", percent: 0, message: "Starting generation..." });
    const request = {
      id: Date.now().toString(),
      prompt,
      status: "running"
    };
    setCurrentRequest(request);
    setRequests((prev) => [...prev, request]);
    try {
      console.log("[useDeepAgentGeneration] Generating from prompt:", prompt);
      await new Promise((resolve) => setTimeout(resolve, 100));
      request.status = "completed";
      setCurrentRequest(request);
      setIsComplete(true);
      setProgress({ stage: "complete", percent: 100, message: "Generation complete" });
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      setError(errorMessage);
      request.status = "failed";
      request.error = errorMessage;
      setCurrentRequest(request);
      return null;
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  }, []);
  const startGeneration = useCallback(async (skill, prompt, _options) => {
    console.log("[useDeepAgentGeneration] Starting generation with skill:", skill);
    await generate(prompt);
  }, [generate]);
  const cancelGeneration = useCallback(() => {
    if (currentRequest) {
      currentRequest.status = "failed";
      currentRequest.error = "Cancelled by user";
      setCurrentRequest(null);
    }
    setIsGenerating(false);
    setIsLoading(false);
    setIsComplete(false);
    setProgress({ stage: "idle", percent: 0, message: "" });
  }, [currentRequest]);
  const clearRequests = useCallback(() => {
    setRequests([]);
    setCurrentRequest(null);
    setError(null);
    setProgress({ stage: "idle", percent: 0, message: "" });
    setIsComplete(false);
  }, []);
  const submitInterruptDecisions = useCallback((decisions) => {
    console.log("[useDeepAgentGeneration] Submitting interrupt decisions:", decisions);
    setInterrupt(null);
  }, []);
  return {
    requests,
    currentRequest,
    isGenerating,
    isLoading,
    isComplete,
    progress,
    error,
    interrupt,
    generate,
    startGeneration,
    cancelGeneration,
    clearRequests,
    submitInterruptDecisions
  };
}
var UI_EVENT_MAP = {
  // Form/CRUD events
  "UI:SAVE": "SAVE",
  "UI:CANCEL": "CANCEL",
  "UI:CLOSE": "CLOSE",
  "UI:VIEW": "VIEW",
  "UI:EDIT": "EDIT",
  "UI:DELETE": "DELETE",
  "UI:CREATE": "CREATE",
  "UI:SELECT": "SELECT",
  "UI:DESELECT": "DESELECT",
  "UI:SUBMIT": "SAVE",
  "UI:UPDATE_STATUS": "UPDATE_STATUS",
  "UI:SEARCH": "SEARCH",
  "UI:CLEAR_SEARCH": "CLEAR_SEARCH",
  "UI:ADD": "CREATE",
  // Game events (for closed circuit with GameMenu, GamePauseOverlay, GameOverScreen)
  "UI:PAUSE": "PAUSE",
  "UI:RESUME": "RESUME",
  "UI:RESTART": "RESTART",
  "UI:GAME_OVER": "GAME_OVER",
  "UI:START": "START",
  "UI:QUIT": "QUIT",
  "UI:INIT": "INIT"
};
function useUIEvents(dispatch, validEvents, eventBusInstance) {
  const defaultEventBus = useEventBus();
  const eventBus = eventBusInstance ?? defaultEventBus;
  const validEventsKey = validEvents ? validEvents.slice().sort().join(",") : "";
  const stableValidEvents = useMemo(
    () => validEvents,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validEventsKey]
  );
  useEffect(() => {
    const unsubscribes = [];
    Object.entries(UI_EVENT_MAP).forEach(([uiEvent, smEvent]) => {
      const handler = (event) => {
        if (!stableValidEvents || stableValidEvents.includes(smEvent)) {
          dispatch(smEvent, event.payload);
        }
      };
      const unsubscribe = eventBus.on(uiEvent, handler);
      unsubscribes.push(unsubscribe);
    });
    const genericHandler = (event) => {
      const eventName = event.payload?.event;
      if (eventName) {
        const smEvent = eventName;
        if (!stableValidEvents || stableValidEvents.includes(smEvent)) {
          dispatch(smEvent, event.payload);
        }
      }
    };
    const genericUnsubscribe = eventBus.on("UI:DISPATCH", genericHandler);
    unsubscribes.push(genericUnsubscribe);
    if (stableValidEvents) {
      stableValidEvents.forEach((smEvent) => {
        const uiPrefixedEvent = `UI:${smEvent}`;
        const alreadyMapped = Object.keys(UI_EVENT_MAP).includes(uiPrefixedEvent);
        if (!alreadyMapped) {
          const directHandler = (event) => {
            dispatch(smEvent, event.payload);
          };
          const unsubscribePrefixed = eventBus.on(
            uiPrefixedEvent,
            directHandler
          );
          unsubscribes.push(unsubscribePrefixed);
          const unsubscribeDirect = eventBus.on(smEvent, directHandler);
          unsubscribes.push(unsubscribeDirect);
        }
      });
    }
    return () => {
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, [eventBus, dispatch, stableValidEvents]);
}
function useSelectedEntity(eventBusInstance) {
  const defaultEventBus = useEventBus();
  const eventBus = eventBusInstance ?? defaultEventBus;
  const selectionContext = useSelectionContext();
  const [localSelected, setLocalSelected] = useState(null);
  const usingContext = selectionContext !== null;
  useEffect(() => {
    if (usingContext) return;
    const handleSelect = (event) => {
      const row = event.payload?.row;
      if (row) {
        setLocalSelected(row);
      }
    };
    const handleDeselect = () => {
      setLocalSelected(null);
    };
    const unsubSelect = eventBus.on("UI:SELECT", handleSelect);
    const unsubView = eventBus.on("UI:VIEW", handleSelect);
    const unsubDeselect = eventBus.on("UI:DESELECT", handleDeselect);
    const unsubClose = eventBus.on("UI:CLOSE", handleDeselect);
    const unsubCancel = eventBus.on("UI:CANCEL", handleDeselect);
    return () => {
      [unsubSelect, unsubView, unsubDeselect, unsubClose, unsubCancel].forEach(
        (unsub) => {
          if (typeof unsub === "function") unsub();
        }
      );
    };
  }, [eventBus, usingContext]);
  if (selectionContext) {
    return [selectionContext.selected, selectionContext.setSelected];
  }
  return [localSelected, setLocalSelected];
}
function useSelectionContext() {
  const context = useContext(SelectionContext);
  return context;
}
var ENTITY_EVENTS = {
  CREATE: "ENTITY_CREATE",
  UPDATE: "ENTITY_UPDATE",
  DELETE: "ENTITY_DELETE"
};
async function sendOrbitalEvent(orbitalName, eventPayload) {
  const response = await apiClient.post(
    `/orbitals/${orbitalName}/events`,
    eventPayload
  );
  return response;
}
function useOrbitalMutations(entityName, orbitalName, options) {
  const queryClient = useQueryClient();
  const events = {
    create: options?.events?.create || ENTITY_EVENTS.CREATE,
    update: options?.events?.update || ENTITY_EVENTS.UPDATE,
    delete: options?.events?.delete || ENTITY_EVENTS.DELETE
  };
  const log = (message, data) => {
    if (options?.debug) {
      console.log(`[useOrbitalMutations:${orbitalName}] ${message}`, data ?? "");
    }
  };
  const createMutation = useMutation({
    mutationFn: async (data) => {
      log("Creating entity", data);
      return sendOrbitalEvent(orbitalName, {
        event: events.create,
        payload: { data, entityType: entityName }
      });
    },
    onSuccess: (response) => {
      log("Create succeeded", response);
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
    },
    onError: (error) => {
      console.error(`[useOrbitalMutations] Create failed:`, error);
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }) => {
      log(`Updating entity ${id}`, data);
      return sendOrbitalEvent(orbitalName, {
        event: events.update,
        entityId: id,
        payload: { data, entityType: entityName }
      });
    },
    onSuccess: (response, variables) => {
      log("Update succeeded", response);
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
      queryClient.invalidateQueries({
        queryKey: entityDataKeys.detail(entityName, variables.id)
      });
    },
    onError: (error) => {
      console.error(`[useOrbitalMutations] Update failed:`, error);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      log(`Deleting entity ${id}`);
      return sendOrbitalEvent(orbitalName, {
        event: events.delete,
        entityId: id,
        payload: { entityType: entityName }
      });
    },
    onSuccess: (response, id) => {
      log("Delete succeeded", response);
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
      queryClient.removeQueries({ queryKey: entityDataKeys.detail(entityName, id) });
    },
    onError: (error) => {
      console.error(`[useOrbitalMutations] Delete failed:`, error);
    }
  });
  return {
    // Async functions
    createEntity: async (data) => {
      return createMutation.mutateAsync(data);
    },
    updateEntity: async (id, data) => {
      if (!id) {
        console.warn("[useOrbitalMutations] Cannot update without ID");
        return;
      }
      return updateMutation.mutateAsync({ id, data });
    },
    deleteEntity: async (id) => {
      if (!id) {
        console.warn("[useOrbitalMutations] Cannot delete without ID");
        return;
      }
      return deleteMutation.mutateAsync(id);
    },
    // Mutation objects for fine-grained control
    createMutation,
    updateMutation,
    deleteMutation,
    // Aggregate states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    // Errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
}
function useSendOrbitalEvent(orbitalName) {
  const mutation = useMutation({
    mutationFn: async (payload) => {
      return sendOrbitalEvent(orbitalName, payload);
    }
  });
  return {
    sendEvent: async (event, payload, entityId) => {
      return mutation.mutateAsync({ event, payload, entityId });
    },
    isPending: mutation.isPending,
    error: mutation.error,
    data: mutation.data
  };
}

// hooks/useEntityMutations.ts
function entityToCollection(entityName) {
  return entityName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "-list";
}
function useCreateEntity(entityName) {
  const queryClient = useQueryClient();
  const collection = entityToCollection(entityName);
  return useMutation({
    mutationFn: async (data) => {
      console.log(`[useCreateEntity] Creating ${entityName}:`, data);
      const response = await apiClient.post(
        `/${collection}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
    },
    onError: (error) => {
      console.error(`[useCreateEntity] Failed to create ${entityName}:`, error);
    }
  });
}
function useUpdateEntity(entityName) {
  const queryClient = useQueryClient();
  const collection = entityToCollection(entityName);
  return useMutation({
    mutationFn: async ({ id, data }) => {
      console.log(`[useUpdateEntity] Updating ${entityName} ${id}:`, data);
      const response = await apiClient.patch(
        `/${collection}/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
      queryClient.invalidateQueries({ queryKey: entityDataKeys.detail(entityName, variables.id) });
    },
    onError: (error) => {
      console.error(`[useUpdateEntity] Failed to update ${entityName}:`, error);
    }
  });
}
function useDeleteEntity(entityName) {
  const queryClient = useQueryClient();
  const collection = entityToCollection(entityName);
  return useMutation({
    mutationFn: async (id) => {
      console.log(`[useDeleteEntity] Deleting ${entityName} ${id}`);
      await apiClient.delete(`/${collection}/${id}`);
      return { id };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
      queryClient.removeQueries({ queryKey: entityDataKeys.detail(entityName, id) });
    },
    onError: (error) => {
      console.error(`[useDeleteEntity] Failed to delete ${entityName}:`, error);
    }
  });
}
async function sendOrbitalMutation(orbitalName, event, entityId, payload) {
  const response = await apiClient.post(
    `/orbitals/${orbitalName}/events`,
    { event, entityId, payload }
  );
  return response;
}
function useEntityMutations(entityName, options) {
  const queryClient = useQueryClient();
  const useOrbitalRoute = !!options?.orbitalName;
  const events = {
    create: options?.events?.create || ENTITY_EVENTS.CREATE,
    update: options?.events?.update || ENTITY_EVENTS.UPDATE,
    delete: options?.events?.delete || ENTITY_EVENTS.DELETE
  };
  const createMutation = useCreateEntity(entityName);
  const updateMutation = useUpdateEntity(entityName);
  const deleteMutation = useDeleteEntity(entityName);
  const orbitalCreateMutation = useMutation({
    mutationFn: async (data) => {
      return sendOrbitalMutation(options.orbitalName, events.create, void 0, {
        data,
        entityType: entityName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
    }
  });
  const orbitalUpdateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return sendOrbitalMutation(options.orbitalName, events.update, id, {
        data,
        entityType: entityName
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
      queryClient.invalidateQueries({
        queryKey: entityDataKeys.detail(entityName, variables.id)
      });
    }
  });
  const orbitalDeleteMutation = useMutation({
    mutationFn: async (id) => {
      return sendOrbitalMutation(options.orbitalName, events.delete, id, {
        entityType: entityName
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: entityDataKeys.list(entityName) });
      queryClient.removeQueries({ queryKey: entityDataKeys.detail(entityName, id) });
    }
  });
  const activeMutations = {
    create: useOrbitalRoute ? orbitalCreateMutation : createMutation,
    update: useOrbitalRoute ? orbitalUpdateMutation : updateMutation,
    delete: useOrbitalRoute ? orbitalDeleteMutation : deleteMutation
  };
  return {
    // Async functions that can be called directly
    // Accepts either (data) or (entityName, data) for compiler compatibility
    createEntity: async (entityOrData, data) => {
      const actualData = typeof entityOrData === "string" ? data : entityOrData;
      if (!actualData) {
        console.warn("[useEntityMutations] Cannot create entity without data");
        return;
      }
      return activeMutations.create.mutateAsync(actualData);
    },
    updateEntity: async (id, data) => {
      if (!id) {
        console.warn("[useEntityMutations] Cannot update entity without ID");
        return;
      }
      return activeMutations.update.mutateAsync({ id, data });
    },
    deleteEntity: async (id) => {
      if (!id) {
        console.warn("[useEntityMutations] Cannot delete entity without ID");
        return;
      }
      return activeMutations.delete.mutateAsync(id);
    },
    // Mutation states for UI feedback
    isCreating: activeMutations.create.isPending,
    isUpdating: activeMutations.update.isPending,
    isDeleting: activeMutations.delete.isPending,
    createError: activeMutations.create.error,
    updateError: activeMutations.update.error,
    deleteError: activeMutations.delete.error
  };
}
function useEntities() {
  const entities = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    entities,
    getEntity,
    getByType,
    getAllEntities,
    getSingleton,
    spawnEntity,
    updateEntity,
    updateSingleton,
    removeEntity,
    clearEntities
  };
}
function useEntity(id) {
  const entities = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return entities.get(id);
}
function useEntitiesByType(type) {
  const entities = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [...entities.values()].filter((e) => e.type === type);
}
function useSingletonEntity(type) {
  const entities = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [...entities.values()].find((e) => e.type === type);
}
function usePlayer() {
  const player = useSingletonEntity("Player");
  const update = useCallback((updates) => {
    if (player) updateEntity(player.id, updates);
  }, [player?.id]);
  return { player, updatePlayer: update };
}
function usePhysics() {
  const physics = useSingletonEntity("Physics");
  const update = useCallback((updates) => {
    if (physics) updateEntity(physics.id, updates);
  }, [physics?.id]);
  return { physics, updatePhysics: update };
}
function useInput() {
  const input = useSingletonEntity("Input");
  const update = useCallback((updates) => {
    if (input) updateEntity(input.id, updates);
  }, [input?.id]);
  return { input, updateInput: update };
}
function useResolvedEntity(entity, data) {
  const shouldFetch = !data && !!entity;
  const fetched = useEntityList(entity, { skip: !shouldFetch });
  return useMemo(() => {
    if (data) {
      return {
        data,
        isLocal: true,
        isLoading: false,
        error: null
      };
    }
    return {
      data: fetched.data,
      isLocal: false,
      isLoading: fetched.isLoading,
      error: fetched.error
    };
  }, [data, fetched.data, fetched.isLoading, fetched.error]);
}

// hooks/useAuthContext.ts
function useAuthContext() {
  return {
    user: null,
    loading: false,
    signIn: void 0,
    signOut: void 0
  };
}
var API_BASE = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL : "http://localhost:3000";
function getUserId() {
  return localStorage.getItem("userId") || "anonymous";
}
async function fetchWithAuth(endpoint, options) {
  const userId = getUserId();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...options?.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || "Request failed");
  }
  return response.json();
}
function useGitHubStatus() {
  return useQuery({
    queryKey: ["github", "status"],
    queryFn: () => fetchWithAuth("/api/github/status"),
    staleTime: 6e4,
    // 1 minute
    retry: false
  });
}
function useConnectGitHub() {
  const connectGitHub = useCallback(() => {
    const userId = getUserId();
    const state = btoa(JSON.stringify({ userId, returnUrl: window.location.href }));
    window.location.href = `${API_BASE}/api/github/oauth/authorize?state=${state}`;
  }, []);
  return { connectGitHub };
}
function useDisconnectGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchWithAuth("/api/github/disconnect", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github", "status"] });
      queryClient.removeQueries({ queryKey: ["github", "repos"] });
    }
  });
}
function useGitHubRepos(page = 1, perPage = 30) {
  return useQuery({
    queryKey: ["github", "repos", page, perPage],
    queryFn: () => fetchWithAuth(`/api/github/repos?page=${page}&per_page=${perPage}`),
    enabled: true,
    // Only fetch if user is connected
    staleTime: 3e5
    // 5 minutes
  });
}
function useGitHubRepo(owner, repo, enabled = true) {
  return useQuery({
    queryKey: ["github", "repo", owner, repo],
    queryFn: () => fetchWithAuth(`/api/github/repos/${owner}/${repo}`),
    enabled: enabled && !!owner && !!repo,
    staleTime: 3e5
    // 5 minutes
  });
}
function useGitHubBranches(owner, repo, enabled = true) {
  return useQuery({
    queryKey: ["github", "branches", owner, repo],
    queryFn: () => fetchWithAuth(`/api/github/repos/${owner}/${repo}/branches`),
    enabled: enabled && !!owner && !!repo,
    staleTime: 6e4
    // 1 minute
  });
}

export { ENTITY_EVENTS, useAgentChat, useAuthContext, useCompile, useConnectGitHub, useCreateEntity, useDeepAgentGeneration, useDeleteEntity, useDisconnectGitHub, useEntities, useEntitiesByType, useEntity, useEntityMutations, useExtensions, useFileEditor, useFileSystem, useGitHubBranches, useGitHubRepo, useGitHubRepos, useGitHubStatus, useInput, useOrbitalHistory, useOrbitalMutations, usePhysics, usePlayer, usePreview, useResolvedEntity, useSelectedEntity, useSendOrbitalEvent, useSingletonEntity, useUIEvents, useUpdateEntity, useValidation };
