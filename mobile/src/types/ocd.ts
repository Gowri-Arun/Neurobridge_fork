export type OCDSubtype =
  | "contamination"
  | "checking"
  | "symmetry"
  | "harm"
  | "scrupulosity"
  | "relationship"
  | "somatic"
  | "other";

export type MoodEmoji = "😞" | "😟" | "😐" | "🙂" | "😊";

export interface ExposureHierarchy {
  id: string;
  title: string;
  subtype: OCDSubtype;
  createdAt: string;
  updatedAt: string;
  masteryThresholdSessions: number;
  itemIds: string[];
}

export interface ExposureItem {
  id: string;
  hierarchyId: string;
  parentId: string | null;
  title: string;
  subtype: OCDSubtype;
  difficultyLevel: number;
  sortOrder: number;
  active: boolean;
  masteryFlag: boolean;
  masteryAchievedAt?: string;
}

export interface ExposureSession {
  id: string;
  exposureItemId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  preSuds: number;
  postSuds?: number;
  compulsionResistanceCount: number;
  completed: boolean;
  notes?: string;
}

export interface SUDSLog {
  id: string;
  sessionId: string;
  timestamp: string;
  suds: number;
}

export interface CompulsionResistanceLog {
  id: string;
  sessionId: string;
  timestamp: string;
  resistedCompulsion: string;
  urgeIntensity: number;
  successful: boolean;
}

export interface ThoughtTriggerJournalEntry {
  id: string;
  timestamp: string;
  quickType: "obsession" | "compulsionUrge" | "trigger" | "mood";
  text?: string;
  voiceTranscript?: string;
  moodEmoji: MoodEmoji;
  moodScore: number;
  urgency: number;
  subtypeGuess?: OCDSubtype;
  triggerTags: string[];
  location?: { lat: number; lng: number; label?: string };
  photoUri?: string;
  audioUri?: string;
}

export interface ResponsePreventionGoal {
  id: string;
  title: string;
  rationale: string;
  targetBehavior: string;
  targetCount: number;
  completedCount: number;
  dueDate: string;
  adaptiveLevel: number;
  successProbability: number;
  resetCompassionCopy: string;
}

export interface MindfulnessSessionTemplate {
  id: string;
  title: string;
  type: "urge_surfing" | "uncertainty_tolerance" | "label_release" | "breathing_4_7_8" | "body_scan";
  durationMinutes: 1 | 2 | 3 | 4 | 5;
  script: string[];
}

export interface MindfulnessSessionRun {
  id: string;
  templateId: string;
  subtype: OCDSubtype;
  startedAt: string;
  durationMinutes: number;
  preMood: number;
  postMood?: number;
  effectiveness?: number;
}

export interface RiskWindow {
  hour: number;
  confidence: number;
  reason: string;
}

export interface WeeklyInsight {
  weekOf: string;
  subtypeMix: Record<OCDSubtype, number>;
  moodCompulsionCorrelation: number;
  highestRiskWindows: RiskWindow[];
  narrative: string;
}
