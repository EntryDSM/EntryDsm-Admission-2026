import { useContext } from "react";
import { CalculationDataContext } from "./CalculationDataContext";

export const useCalculationData = () => {
  const context = useContext(CalculationDataContext);
  if (context === undefined) {
    throw new Error("useCalculationData must be used within a CalculationDataProvider");
  }
  return context;
};
