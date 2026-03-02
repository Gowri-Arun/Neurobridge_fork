import { create } from "zustand";
import { buildErpCoachingMessage, shouldMarkMastery } from "../ai/erpCoach";
import { buildWeeklyInsight, inferSubtype } from "../ai/journalAnalyzer";
import { generateSmartGoals } from "../ai/goalEngine";
import type {
  CompulsionResistanceLog,
  ExposureHierarchy,
  ExposureItem,
  ExposureSession,
  MindfulnessSessionRun,
  ResponsePreventionGoal,
  SUDSLog,
  ThoughtTriggerJournalEntry,
  WeeklyInsight,
} from "../types/ocd";

interface OcdState {
  hierarchies: ExposureHierarchy[];
  exposureItems: ExposureItem[];
  sessions: ExposureSession[];
  sudsLogs: SUDSLog[];
  resistanceLogs: CompulsionResistanceLog[];
  journalEntries: ThoughtTriggerJournalEntry[];
  goals: ResponsePreventionGoal[];
  mindfulnessRuns: MindfulnessSessionRun[];
  weeklyInsight?: WeeklyInsight;

  addHierarchy: (payload: ExposureHierarchy) => void;
  addExposureItem: (payload: ExposureItem) => void;
  startSession: (payload: ExposureSession) => void;
  appendSuds: (payload: SUDSLog) => void;
  completeSession: (sessionId: string, postSuds: number) => string;
  addResistanceLog: (payload: CompulsionResistanceLog) => void;
  quickLogThought: (payload: Omit<ThoughtTriggerJournalEntry, "subtypeGuess">) => void;
  refreshGoals: () => void;
  addMindfulnessRun: (payload: MindfulnessSessionRun) => void;
  buildWeekly: (weekOf: string) => void;
}

export const useOcdStore = create<OcdState>((set, get) => ({
  hierarchies: [],
  exposureItems: [],
  sessions: [],
  sudsLogs: [],
  resistanceLogs: [],
  journalEntries: [],
  goals: [],
  mindfulnessRuns: [],

  addHierarchy: (payload) => set((state) => ({ hierarchies: [...state.hierarchies, payload] })),

  addExposureItem: (payload) => set((state) => ({ exposureItems: [...state.exposureItems, payload] })),

  startSession: (payload) => set((state) => ({ sessions: [...state.sessions, payload] })),

  appendSuds: (payload) => set((state) => ({ sudsLogs: [...state.sudsLogs, payload] })),

  completeSession: (sessionId, postSuds) => {
    const state = get();
    const session = state.sessions.find((entry) => entry.id === sessionId);
    if (!session) return "Session not found.";

    const updatedSession: ExposureSession = {
      ...session,
      postSuds,
      completed: true,
      endedAt: new Date().toISOString(),
    };

    const sessions = state.sessions.map((entry) => (entry.id === sessionId ? updatedSession : entry));

    const relatedSessions = sessions.filter((entry) => entry.exposureItemId === updatedSession.exposureItemId);
    const hierarchy = state.hierarchies.find((entry) => entry.id === state.exposureItems.find((item) => item.id === updatedSession.exposureItemId)?.hierarchyId);

    const masteryThreshold = hierarchy?.masteryThresholdSessions ?? 3;
    const mastered = shouldMarkMastery(relatedSessions, masteryThreshold);

    const nextItems = state.exposureItems.map((item) =>
      item.id === updatedSession.exposureItemId ? { ...item, masteryFlag: mastered, masteryAchievedAt: mastered ? new Date().toISOString() : undefined } : item,
    );

    const coachingMessage = buildErpCoachingMessage(
      updatedSession,
      state.sudsLogs.filter((entry) => entry.sessionId === updatedSession.id),
    );

    set({ sessions, exposureItems: nextItems });
    return coachingMessage;
  },

  addResistanceLog: (payload) => set((state) => ({ resistanceLogs: [...state.resistanceLogs, payload] })),

  quickLogThought: (payload) => {
    const subtypeGuess = inferSubtype(`${payload.text ?? ""} ${payload.voiceTranscript ?? ""}`.trim());
    set((state) => ({ journalEntries: [{ ...payload, subtypeGuess }, ...state.journalEntries] }));
  },

  refreshGoals: () => {
    const state = get();
    const goals = generateSmartGoals(state.journalEntries, state.sessions);
    set({ goals });
  },

  addMindfulnessRun: (payload) => set((state) => ({ mindfulnessRuns: [payload, ...state.mindfulnessRuns] })),

  buildWeekly: (weekOf) => {
    const state = get();
    const weeklyInsight = buildWeeklyInsight(state.journalEntries, weekOf);
    set({ weeklyInsight });
  },
}));
