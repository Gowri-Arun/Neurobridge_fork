import type { ExposureSession, ResponsePreventionGoal, ThoughtTriggerJournalEntry } from "../types/ocd";

export const generateSmartGoals = (
  journalEntries: ThoughtTriggerJournalEntry[],
  exposureSessions: ExposureSession[],
): ResponsePreventionGoal[] => {
  const highUrgency = journalEntries.filter((entry) => entry.urgency >= 7);
  const avgMood =
    journalEntries.length > 0
      ? journalEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / journalEntries.length
      : 5;

  const completedSessions = exposureSessions.filter((session) => session.completed).length;
  const adaptiveLevel = Math.min(5, Math.max(1, Math.floor(completedSessions / 5) + 1));

  const baseProbability = Math.max(0.2, Math.min(0.9, (avgMood / 10) * 0.5 + (1 - highUrgency.length / 20) * 0.5));

  return [
    {
      id: "goal-delay-ritual",
      title: "Delay first ritual by 3 minutes",
      rationale: "Build uncertainty tolerance before neutralizing.",
      targetBehavior: "Delay ritual response",
      targetCount: adaptiveLevel,
      completedCount: 0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      adaptiveLevel,
      successProbability: Number(baseProbability.toFixed(2)),
      resetCompassionCopy: "A hard moment happened. Restart from the next urge with a shorter delay.",
    },
    {
      id: "goal-log-urges",
      title: "Log urge peaks before acting",
      rationale: "Noticing urge wave supports response prevention.",
      targetBehavior: "Urge-only logging",
      targetCount: Math.max(2, adaptiveLevel - 1),
      completedCount: 0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      adaptiveLevel,
      successProbability: Number((baseProbability * 0.95).toFixed(2)),
      resetCompassionCopy: "No shame. Logging one urge still counts as skill practice.",
    },
  ];
};
