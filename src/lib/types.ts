export type GrammarStatus = "red" | "yellow" | "green";
export type ResourceStatus = "queue" | "active" | "done";
export type VocabGroup = 1 | 2 | 3;

export interface DayLog {
  day: string; // YYYY-MM-DD
  anki: boolean;
  main: boolean;
  steps: boolean[];
}

export interface Phrase {
  id: string;
  tr: string;
  en: string;
  example: string;
  source: string;
  in_anki: boolean;
  created_at: string;
}

export interface Vocab {
  id: string;
  word: string;
  meaning: string;
  sentence: string;
  group: VocabGroup;
  in_anki: boolean;
  created_at: string;
}

export interface GrammarTopic {
  id: string;
  name: string;
  status: GrammarStatus;
  note: string;
  auto: boolean;
  created_at: string;
}

export interface WritingLog {
  id: string;
  day: string;
  level: string;
  task: string;
  errors: string[];
  created_at: string;
}

export interface WeeklyNote {
  week_start: string;
  learned: string;
  hard: string;
  next_focus: string;
}

export interface LevelTest {
  id: string;
  day: string;
  bc_grammar: string;
  bc_vocab: string;
  bc_level: string;
  ef_reading: string;
  ef_listening: string;
  ef_total: string;
  cefr: string;
  note: string;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  author: string;
  url: string;
  status: ResourceStatus;
  skills: string[];
  progress: string;
  note: string;
  created_at: string;
  updated_at: string;
}

/** Maps every Supabase table to its row type. */
export interface Tables {
  day_logs: DayLog;
  phrases: Phrase;
  vocab: Vocab;
  grammar_topics: GrammarTopic;
  writing_logs: WritingLog;
  weekly_notes: WeeklyNote;
  level_tests: LevelTest;
  resources: Resource;
}

export type TableName = keyof Tables;
