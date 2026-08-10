import React, { useCallback, useReducer } from "react";
import {
  CalculationDataContext,
  calculationReducer,
  initialState,
  type CalculationState,
  type CalculationContextType,
} from "./CalculationDataContext";

const DB_NAME = "CalculationFormDB";
const DB_VERSION = 1;
const STORE_NAME = "calculationData";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

const waitForTransaction = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });

const saveToIndexedDB = async (data: CalculationState): Promise<void> => {
  const db = await openDB();

  try {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put({ id: "calculationData", data });

    await waitForTransaction(transaction);
  } finally {
    db.close();
  }
};

const loadFromIndexedDB = async (): Promise<CalculationState | null> => {
  const db = await openDB();

  try {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const result = await new Promise<{ id: string; data: CalculationState } | undefined>((resolve, reject) => {
      const request = store.get("calculationData");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await waitForTransaction(transaction);

    return result ? result.data : null;
  } finally {
    db.close();
  }
};

export const CalculationDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(calculationReducer, initialState);

  const updatePageData = useCallback(<T extends keyof CalculationState>(page: T, data: CalculationState[T]) => {
    dispatch({ type: "UPDATE_PAGE_DATA", payload: { page, data } });
  }, []);

  const saveToStorage = useCallback(async () => {
    try {
      await saveToIndexedDB(state);
      console.log("계산 데이터가 저장되었습니다.");
    } catch (error) {
      console.error("계산 데이터 저장 실패:", error);
    }
  }, [state]);

  const deleteFromIndexedDB = async (): Promise<void> => {
    const db = await openDB();

    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      store.delete("calculationData");

      await waitForTransaction(transaction);
    } finally {
      db.close();
    }
  };

  const loadFromStorage = useCallback(async () => {
    try {
      const savedData = await loadFromIndexedDB();
      if (savedData) {
        dispatch({ type: "LOAD_FROM_STORAGE", payload: savedData });
        console.log("저장된 계산 데이터를 불러왔습니다.");
      }
    } catch (error) {
      console.error("계산 데이터 로드 실패:", error);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await deleteFromIndexedDB();
      dispatch({ type: "CLEAR_ALL_DATA" });
    } catch (error) {
      console.error("계산 데이터 삭제 실패:", error);
    }
  }, []);
  const value: CalculationContextType = {
    state,
    updatePageData,
    saveToStorage,
    loadFromStorage,
    clearAllData,
  };

  return <CalculationDataContext.Provider value={value}>{children}</CalculationDataContext.Provider>;
};
