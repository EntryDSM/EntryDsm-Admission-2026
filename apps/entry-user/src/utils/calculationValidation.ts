import { createRequiredFieldsValidator, validateRouteData } from "@entry/utils";
import type { CalculationState } from "../contexts";

const pageValidations = {
  "/calculate/primary/first-graduate": createRequiredFieldsValidator<CalculationState["primaryFirst"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/primary/second-graduate": createRequiredFieldsValidator<CalculationState["primarySecond"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/primary/third-graduate": createRequiredFieldsValidator<CalculationState["primaryThird"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/primary/activity": createRequiredFieldsValidator<CalculationState["primaryActivity"]>([
    "absences",
    "earlyLeaves",
    "lateArrivals",
    "resultMissing",
    "volunteerHours",
    "dsmAlgorithm",
    "infoProcessing",
  ]),
  "/calculate/graduated/third2": createRequiredFieldsValidator<CalculationState["graduatedThird2"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/graduated/third1": createRequiredFieldsValidator<CalculationState["graduatedThird1"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/graduated/second2": createRequiredFieldsValidator<CalculationState["graduatedSecond2"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/graduated/second1": createRequiredFieldsValidator<CalculationState["graduatedSecond1"]>([
    "kor",
    "soc",
    "his",
    "math",
    "sci",
    "tech",
    "eng",
  ]),
  "/calculate/graduated/activity": createRequiredFieldsValidator<CalculationState["graduatedActivity"]>([
    "absences",
    "earlyLeaves",
    "lateArrivals",
    "resultMissing",
    "volunteerHours",
    "dsmAlgorithm",
    "infoProcessing",
  ]),
  "/calculate/qe/score": createRequiredFieldsValidator<CalculationState["qeScore"]>([
    "korean",
    "social",
    "history",
    "science",
    "technology",
    "math",
    "english",
  ]),
  "/calculate/qe/activity": createRequiredFieldsValidator<CalculationState["qeActivity"]>([
    "dsmAlgorithm",
    "infoProcessing",
  ]),
} as const;

const routeToStateKey = {
  "/calculate/primary/first-graduate": "primaryFirst",
  "/calculate/primary/second-graduate": "primarySecond",
  "/calculate/primary/third-graduate": "primaryThird",
  "/calculate/primary/activity": "primaryActivity",
  "/calculate/graduated/third2": "graduatedThird2",
  "/calculate/graduated/third1": "graduatedThird1",
  "/calculate/graduated/second2": "graduatedSecond2",
  "/calculate/graduated/second1": "graduatedSecond1",
  "/calculate/graduated/activity": "graduatedActivity",
  "/calculate/qe/score": "qeScore",
  "/calculate/qe/activity": "qeActivity",
} as const satisfies Record<string, keyof CalculationState>;

export const validateCalculationPage = (state: CalculationState, route: string) =>
  validateRouteData({
    state,
    route,
    pageValidations,
    routeToStateKey,
  });

export const canProceedToNextCalculationStep = (state: CalculationState, route: string) => {
  return {
    canProceed: validateCalculationPage(state, route).isValid,
  };
};
