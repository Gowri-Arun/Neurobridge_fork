import type {
  CompulsionResistanceLog,
  ExposureHierarchy,
  ExposureItem,
  ExposureSession,
  MindfulnessSessionRun,
  ResponsePreventionGoal,
  SUDSLog,
  ThoughtTriggerJournalEntry,
} from "../types/ocd";

export interface LocalRepository {
  saveHierarchy: (payload: ExposureHierarchy) => Promise<void>;
  saveExposureItem: (payload: ExposureItem) => Promise<void>;
  saveExposureSession: (payload: ExposureSession) => Promise<void>;
  saveSudsLog: (payload: SUDSLog) => Promise<void>;
  saveResistanceLog: (payload: CompulsionResistanceLog) => Promise<void>;
  saveJournalEntry: (payload: ThoughtTriggerJournalEntry) => Promise<void>;
  saveGoal: (payload: ResponsePreventionGoal) => Promise<void>;
  saveMindfulnessRun: (payload: MindfulnessSessionRun) => Promise<void>;

  listExposureItems: (hierarchyId: string) => Promise<ExposureItem[]>;
  listSessionsForItem: (exposureItemId: string) => Promise<ExposureSession[]>;
  listJournalEntries: () => Promise<ThoughtTriggerJournalEntry[]>;
}

export const schemaSql = {
  exposureHierarchies:
    "CREATE TABLE IF NOT EXISTS exposure_hierarchies (id TEXT PRIMARY KEY, encrypted_payload TEXT NOT NULL)",
  exposureItems:
    "CREATE TABLE IF NOT EXISTS exposure_items (id TEXT PRIMARY KEY, hierarchy_id TEXT NOT NULL, encrypted_payload TEXT NOT NULL)",
  exposureSessions:
    "CREATE TABLE IF NOT EXISTS exposure_sessions (id TEXT PRIMARY KEY, exposure_item_id TEXT NOT NULL, encrypted_payload TEXT NOT NULL)",
  sudsLogs: "CREATE TABLE IF NOT EXISTS suds_logs (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, encrypted_payload TEXT NOT NULL)",
  resistanceLogs:
    "CREATE TABLE IF NOT EXISTS compulsion_resistance_logs (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, encrypted_payload TEXT NOT NULL)",
  journal: "CREATE TABLE IF NOT EXISTS journal_entries (id TEXT PRIMARY KEY, encrypted_payload TEXT NOT NULL)",
  goals: "CREATE TABLE IF NOT EXISTS response_goals (id TEXT PRIMARY KEY, encrypted_payload TEXT NOT NULL)",
  mindfulnessRuns: "CREATE TABLE IF NOT EXISTS mindfulness_runs (id TEXT PRIMARY KEY, encrypted_payload TEXT NOT NULL)",
};

export const consentGatedExport = (hasExplicitConsent: boolean, data: unknown) => {
  if (!hasExplicitConsent) {
    throw new Error("Export blocked: user consent required.");
  }
  return data;
};
