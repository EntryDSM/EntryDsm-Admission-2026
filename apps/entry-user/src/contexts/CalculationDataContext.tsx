import { createContext } from "react";

interface IScoreType {
  kor: string | null;
  soc: string | null;
  his: string | null;
  math: string | null;
  sci: string | null;
  tech: string | null;
  eng: string | null;
  [key: string]: string | null;
}

interface IActivityType {
  absences: string;
  earlyLeaves: string;
  lateArrivals: string;
  resultMissing: string;
  volunteerHours: string;
  dsmAlgorithm: "O" | "X" | null;
  infoProcessing: "O" | "X" | null;
}

interface IQEScoreType {
  korean: string;
  social: string;
  history: string;
  science: string;
  technology: string;
  math: string;
  english: string;
}

export interface CalculationState {
  primaryThird: IScoreType;
  primarySecond: IScoreType;
  primaryFirst: IScoreType;
  primaryActivity: IActivityType;

  graduatedThird2: IScoreType;
  graduatedThird1: IScoreType;
  graduatedSecond2: IScoreType;
  graduatedSecond1: IScoreType;
  graduatedActivity: IActivityType;

  qeScore: IQEScoreType;
  qeActivity: IActivityType;
}

type UpdatePageDataAction<T extends keyof CalculationState = keyof CalculationState> = {
  type: "UPDATE_PAGE_DATA";
  payload: { page: T; data: CalculationState[T] };
};

type CalculationAction =
  | UpdatePageDataAction
  | { type: "LOAD_FROM_STORAGE"; payload: CalculationState }
  | { type: "CLEAR_ALL_DATA" };

export const initialState: CalculationState = {
  primaryThird: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  primarySecond: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  primaryFirst: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  primaryActivity: {
    absences: "",
    earlyLeaves: "",
    lateArrivals: "",
    resultMissing: "",
    volunteerHours: "",
    dsmAlgorithm: null,
    infoProcessing: null,
  },

  graduatedThird2: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  graduatedThird1: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  graduatedSecond2: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  graduatedSecond1: {
    kor: null,
    soc: null,
    his: null,
    math: null,
    sci: null,
    tech: null,
    eng: null,
  },
  graduatedActivity: {
    absences: "",
    earlyLeaves: "",
    lateArrivals: "",
    resultMissing: "",
    volunteerHours: "",
    dsmAlgorithm: null,
    infoProcessing: null,
  },

  qeScore: {
    korean: "",
    social: "",
    history: "",
    science: "",
    technology: "",
    math: "",
    english: "",
  },
  qeActivity: {
    absences: "",
    earlyLeaves: "",
    lateArrivals: "",
    resultMissing: "",
    volunteerHours: "",
    dsmAlgorithm: null,
    infoProcessing: null,
  },
};

export const calculationReducer = (state: CalculationState, action: CalculationAction): CalculationState => {
  switch (action.type) {
    case "UPDATE_PAGE_DATA":
      return {
        ...state,
        [action.payload.page]: {
          ...state[action.payload.page],
          ...action.payload.data,
        },
      };
    case "LOAD_FROM_STORAGE":
      return action.payload;
    case "CLEAR_ALL_DATA":
      return initialState;
    default:
      return state;
  }
};

export interface CalculationContextType {
  state: CalculationState;
  updatePageData: (page: keyof CalculationState, data) => void;
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearAllData: () => void;
}

export const CalculationDataContext = createContext<CalculationContextType | undefined>(undefined);
