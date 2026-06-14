import { useRef } from "react";

export const AUTO_SAVE_DELAY = 3000;

export type ToastFn = (msg: string, type: "success" | "error") => void;

type AutoSaveState = {
  previousData: string | null;
  isSaving: boolean;
  skipNextAutoSave: boolean;
  lastManualSave: number;
  lastSavedPage: string | null;
  savingPromise: Promise<void> | null;
  manualSaveTimeoutId: ReturnType<typeof setTimeout> | null;
};

export type AutoSaveController = {
  readonly isSaving: boolean;
  performSave: <T>(
    state: T,
    saveToStorage: () => Promise<void>,
    isManual?: boolean,
    currentPage?: string,
    showToast?: ToastFn
  ) => Promise<boolean>;
  hasChanged: <T>(state: T) => boolean;
  shouldAllowAutoSave: () => boolean;
  onPageChange: (newPage: string) => void;
  confirmManualSaveComplete: () => void;
  reset: () => void;
};

export function serializeStateWithFiles<T>(state: T): string {
  const replacer = (_key: string, value: unknown) => {
    if (typeof File !== "undefined" && value instanceof File) {
      return {
        __isFile: true,
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
        __fileHash: `${value.name}_${value.size}_${value.lastModified}_${value.type}`,
      };
    }

    return value;
  };

  return JSON.stringify(state, replacer);
}

function createInitialState(): AutoSaveState {
  return {
    previousData: null,
    isSaving: false,
    skipNextAutoSave: false,
    lastManualSave: 0,
    lastSavedPage: null,
    savingPromise: null,
    manualSaveTimeoutId: null,
  };
}

export function createAutoSaveController(): AutoSaveController {
  const autoSaveState = createInitialState();

  const clearManualSaveTimeout = () => {
    if (autoSaveState.manualSaveTimeoutId) {
      clearTimeout(autoSaveState.manualSaveTimeoutId);
      autoSaveState.manualSaveTimeoutId = null;
    }
  };

  const hasChanged = <T>(state: T): boolean => {
    if (!state) return false;
    if (!autoSaveState.previousData) return true;

    const currentStateStr = serializeStateWithFiles(state);
    return currentStateStr !== autoSaveState.previousData;
  };

  const shouldAllowAutoSave = (): boolean => {
    if (autoSaveState.skipNextAutoSave) {
      return false;
    }

    const timeSinceManualSave = Date.now() - autoSaveState.lastManualSave;
    return timeSinceManualSave >= AUTO_SAVE_DELAY;
  };

  const performSave = async <T>(
    state: T,
    saveToStorage: () => Promise<void>,
    isManual = false,
    currentPage?: string,
    showToast?: ToastFn
  ): Promise<boolean> => {
    if (autoSaveState.savingPromise) {
      await autoSaveState.savingPromise;
      return false;
    }

    if (!isManual && !shouldAllowAutoSave()) {
      return false;
    }

    if (!hasChanged(state)) {
      return false;
    }

    if (currentPage && autoSaveState.lastSavedPage === currentPage) {
      const currentStateStr = serializeStateWithFiles(state);
      if (autoSaveState.previousData === currentStateStr) {
        return false;
      }
    }

    if (isManual) {
      autoSaveState.lastManualSave = Date.now();
      autoSaveState.skipNextAutoSave = true;

      if (currentPage) {
        autoSaveState.lastSavedPage = currentPage;
      }

      clearManualSaveTimeout();
      autoSaveState.manualSaveTimeoutId = setTimeout(() => {
        autoSaveState.skipNextAutoSave = false;
        autoSaveState.manualSaveTimeoutId = null;
      }, AUTO_SAVE_DELAY + 500);
    }

    autoSaveState.isSaving = true;
    autoSaveState.savingPromise = (async () => {
      try {
        await saveToStorage();
        autoSaveState.previousData = serializeStateWithFiles(state);

        if (currentPage) {
          autoSaveState.lastSavedPage = currentPage;
        }

        const msg = `임시저장이 완료되었습니다.${currentPage ? ` (${currentPage})` : ""}`;
        showToast?.(msg, "success");
      } catch (err) {
        showToast?.("저장에 실패했습니다.", "error");
        throw err;
      } finally {
        autoSaveState.isSaving = false;
        autoSaveState.savingPromise = null;
      }
    })();

    await autoSaveState.savingPromise;
    return true;
  };

  const onPageChange = (newPage: string) => {
    if (autoSaveState.lastSavedPage !== newPage) {
      const timeSinceManualSave = Date.now() - autoSaveState.lastManualSave;
      if (timeSinceManualSave >= 1000) {
        autoSaveState.skipNextAutoSave = false;
      }
    }
  };

  const reset = () => {
    clearManualSaveTimeout();
    Object.assign(autoSaveState, createInitialState());
  };

  return {
    get isSaving() {
      return autoSaveState.isSaving;
    },
    performSave,
    hasChanged,
    shouldAllowAutoSave,
    onPageChange,
    confirmManualSaveComplete() {},
    reset,
  };
}

export function useAutoSaveController(): AutoSaveController {
  const autoSaveControllerRef = useRef<AutoSaveController | null>(null);

  if (!autoSaveControllerRef.current) {
    autoSaveControllerRef.current = createAutoSaveController();
  }

  return autoSaveControllerRef.current;
}
