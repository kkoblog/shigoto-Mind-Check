export enum ScreenName {
  WELCOME = 'welcome',
  QUICK_CHECK = 'quick_check',
  DEEP_DIVE_OPTIN = 'deep_dive_optin',
  MAIN_CHECK = 'main_check',
  RESULT = 'result',
}

export type QuickCheckItem = {
  id: string;
  text: string;
  tags: string[];
};

export type MainCheckItem = {
  id: string;
  domain: string;
  reverse: boolean;
  text: string;
};

export type DomainConfig = {
  key: string;
  label_ja: string;
  reverse: boolean;
};

export type Answers = {
  quickCheck: Record<string, boolean>; // id -> yes/no
  mainCheck: Record<string, number>; // id -> 1-5
  freeText: string;
  deepDiveOptIn: boolean;
};

export type AnalysisResult = {
  headline: string;
  judgement: string; // 'red' | 'yellow' | 'green'
  state_score: number;
  top_causes: Array<{
    key: string;
    label_ja: string;
    score: number;
  }>;
  summary: string;
  next_steps: {
    short_term: string[];
    mid_term: string[];
    long_term: string[];
  };
  cta: {
    text: string;
    button_text: string;
    url: string;
    sub_text: string; // micro-copy
  };
  disclaimer: string;
};