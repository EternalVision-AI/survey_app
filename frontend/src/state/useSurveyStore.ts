import { create } from "zustand";

export type LanguageCode = "de" | "fr" | "it";

export interface SurveyDraft {
  language: LanguageCode;
  consentAccepted?: boolean;
  kesb?: string;
  name?: string;
  role?: string;
  q1?: "yes" | "no";
  q2?: "yes" | "no";
  q3?: string[];
  q3Other?: string;
}

interface SurveyState {
  draft: SurveyDraft | null;
  setDraft: (draft: SurveyDraft) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  reset: () => set({ draft: null }),
}));

