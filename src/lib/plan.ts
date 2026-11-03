import type { GrammarStatus, ResourceStatus, VocabGroup } from "./types";

export type LinkKey = "bbc" | "bcg" | "yt" | "claude" | "wi" | "anki" | "bctest" | "efset";

export const LINKS: Record<LinkKey, { label: string; url: string }> = {
  bbc: { label: "BBC 6 Minute English", url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english" },
  bcg: { label: "British Council Grammar", url: "https://learnenglish.britishcouncil.org/grammar" },
  yt: { label: "Mock interview videoları", url: "https://www.youtube.com/results?search_query=software+developer+mock+interview+english" },
  claude: { label: "Claude'u aç", url: "https://claude.ai/new" },
  wi: { label: "Write & Improve", url: "https://writeandimprove.com/" },
  anki: { label: "AnkiWeb", url: "https://ankiweb.net/decks" },
  bctest: { label: "British Council level test", url: "https://learnenglish.britishcouncil.org/english-levels/online-english-level-test" },
  efset: { label: "EF SET 50 dk", url: "https://www.efset.org/ef-set-50/" },
};

export interface DayPlan {
  title: string;
  duration: string;
  links: LinkKey[];
  steps: string[];
  /** Sunday is a rest day: no Anki or main-study requirement. */
  rest?: boolean;
}

/** Indexed by Date#getDay() (0 = Sunday). */
export const WEEK_PLAN: Record<number, DayPlan> = {
  1: { title: "6 Minute English", duration: "20 dk", links: ["bbc"], steps: ["Metinsiz dinle", "Transcript ile tekrar dinle", "2-3 cümle shadowing yap", "3-5 kalıbı Anki'ye ekle"] },
  2: { title: "Grammar", duration: "20 dk", links: ["bcg"], steps: ["Konuyu oku", "Alıştırmaları çöz", "Yanlışları not et, Grammar sekmesinde durumu güncelle"] },
  3: { title: "Mock interview videosu", duration: "20 dk", links: ["yt"], steps: ["Her sorudan sonra videoyu durdur", "\"Tam olarak ne soruluyor?\" sorusunu kendine sor", "Anlamadığın ifadeleri not et"] },
  4: { title: "Claude ile sohbet", duration: "20 dk", links: ["claude"], steps: ["20 dk serbest sohbet", "Düzeltmeleri ve doğal hallerini oku", "Söyleyemediklerini not et"] },
  5: { title: "6 Minute English + grammar tekrarı", duration: "20 dk", links: ["bbc", "bcg"], steps: ["Bir bölüm dinle (önce metinsiz, sonra transcript)", "Salı çalıştığın grammar konusunu tekrar et"] },
  6: { title: "Mock interview + Write & Improve", duration: "20 + 15 dk", links: ["claude", "wi"], steps: ["Claude ile 20 dk mock interview", "Write & Improve'da 1 task yaz", "Feedback'e göre düzelt ve tekrar gönder", "Seviyeyi ve hataları Writing sekmesine gir"] },
  0: { title: "Dinlen", duration: "5 dk", links: [], steps: ["Haftalık notu yaz"], rest: true },
};

export const PLAN_RESOURCES: { key: LinkKey; purpose: string }[] = [
  { key: "bbc", purpose: "Listening + doğal ifadeler" },
  { key: "bcg", purpose: "Grammar" },
  { key: "yt", purpose: "Mülakat sorusunu anlama" },
  { key: "wi", purpose: "Writing, haftada 1 task" },
  { key: "anki", purpose: "Kelime + kalıp, her gün 10 dk" },
  { key: "claude", purpose: "Sohbet + mock interview" },
];

export const GRAMMAR_SUGGESTIONS = [
  "Articles (a/an/the)", "Prepositions", "Present perfect vs past simple", "Past continuous", "Future forms",
  "Conditionals", "Passive voice", "Relative clauses", "Modal verbs", "Reported speech",
  "Gerund vs infinitive", "Question forms", "Phrasal verbs", "Countable / uncountable", "Comparatives",
];

export const WRITING_ERROR_SUGGESTIONS = [
  "Articles (a/an/the)", "Prepositions", "Present perfect vs past simple", "Word order", "Spelling", "Plurals",
];

export const STATUS_ICON: Record<GrammarStatus, string> = { red: "🔴", yellow: "🟡", green: "🟢" };
export const STATUS_NEXT: Record<GrammarStatus, GrammarStatus> = { red: "yellow", yellow: "green", green: "red" };
export const STATUS_LABEL: Record<GrammarStatus, string> = {
  red: "Öğrenmem gerekiyor",
  yellow: "Biliyorum ama hata yapıyorum",
  green: "Doğru ve konuşurken kullanabiliyorum",
};
export const STATUS_ORDER: Record<GrammarStatus, number> = { red: 0, yellow: 1, green: 2 };

export const VOCAB_GROUPS: Record<VocabGroup, string> = {
  1: "Yeni öğrendiklerim",
  2: "Biliyorum ama kullanamıyorum",
  3: "Rahatça kullanıyorum",
};

export const RESOURCE_TYPES = ["Kitap", "Podcast", "YouTube / video", "Dizi / film", "Website", "App", "Kurs", "Diğer"];
export const SKILLS = ["Listening", "Speaking", "Reading", "Writing", "Grammar", "Vocabulary"];
export const RESOURCE_STATUS: Record<ResourceStatus, string> = { queue: "Sırada", active: "Devam ediyor", done: "Bitti" };

export const PHRASE_SOURCES = ["Konuşma", "Claude sohbet", "Mock interview", "6 Minute English", "Kurs / arkadaş", "Diğer"];

/** Retest window after the last level test, in days (6 to 8 weeks). */
export const RETEST_MIN_DAYS = 42;
export const RETEST_MAX_DAYS = 56;
