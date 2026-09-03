import { useState } from "react";

export const useStepFlow = (initialStep = 1, maxStep: number) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const handleNextStep = () => {
    setCurrentStep(prev => (prev < maxStep ? prev + 1 : prev));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return { currentStep, handleNextStep, goToStep, setCurrentStep };
};
