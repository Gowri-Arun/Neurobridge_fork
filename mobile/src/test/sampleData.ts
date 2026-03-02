import type { ExposureHierarchy, ExposureItem, ExposureSession, ThoughtTriggerJournalEntry } from "../types/ocd";

export const sampleHierarchy: ExposureHierarchy = {
  id: "default-hierarchy",
  title: "Contamination ladder",
  subtype: "contamination",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  masteryThresholdSessions: 3,
  itemIds: ["exp-1", "exp-2"],
};

export const sampleExposureItems: ExposureItem[] = [
  {
    id: "exp-1",
    hierarchyId: "default-hierarchy",
    parentId: null,
    title: "Touch sink handle without washing for 10 min",
    subtype: "contamination",
    difficultyLevel: 4,
    sortOrder: 1,
    active: true,
    masteryFlag: false,
  },
  {
    id: "exp-2",
    hierarchyId: "default-hierarchy",
    parentId: null,
    title: "Use public doorknob then delay washing 15 min",
    subtype: "contamination",
    difficultyLevel: 6,
    sortOrder: 2,
    active: true,
    masteryFlag: false,
  },
];

export const sampleSessions: ExposureSession[] = [
  {
    id: "s1",
    exposureItemId: "exp-1",
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationMinutes: 10,
    preSuds: 70,
    postSuds: 25,
    compulsionResistanceCount: 2,
    completed: true,
  },
  {
    id: "s2",
    exposureItemId: "exp-1",
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationMinutes: 12,
    preSuds: 68,
    postSuds: 22,
    compulsionResistanceCount: 2,
    completed: true,
  },
  {
    id: "s3",
    exposureItemId: "exp-1",
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationMinutes: 15,
    preSuds: 62,
    postSuds: 24,
    compulsionResistanceCount: 3,
    completed: true,
  },
];

export const sampleJournalEntries: ThoughtTriggerJournalEntry[] = [
  {
    id: "j1",
    timestamp: new Date().toISOString(),
    quickType: "trigger",
    text: "Touched a shared keyboard and felt dirty",
    moodEmoji: "😟",
    moodScore: 4,
    urgency: 8,
    triggerTags: ["office", "shared surface"],
    subtypeGuess: "contamination",
  },
  {
    id: "j2",
    timestamp: new Date().toISOString(),
    quickType: "compulsionUrge",
    text: "Need to wash repeatedly",
    moodEmoji: "😐",
    moodScore: 5,
    urgency: 7,
    triggerTags: ["washing urge"],
    subtypeGuess: "contamination",
  },
];
