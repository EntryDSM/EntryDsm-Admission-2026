import { useCallback } from "react";
import { type CalculationState } from "./CalculationDataContext";
import { useCalculationData } from "./useCalculationData";

export const useCalculationPageData = <T extends keyof CalculationState>(page: T) => {
  const { state, updatePageData } = useCalculationData();

  const pageData = state[page];
  const setPageData = useCallback(
    (data: CalculationState[T]) => {
      updatePageData(page, data);
    },
    [page, updatePageData]
  );

  return [pageData, setPageData] as const;
};
