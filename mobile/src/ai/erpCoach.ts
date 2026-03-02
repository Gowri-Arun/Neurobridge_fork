import { COACHING_TEMPLATES } from "../constants/copy";
import type { ExposureSession, SUDSLog } from "../types/ocd";

const REASSURANCE_BANNED_PATTERNS = [
  /you are safe/i,
  /nothing bad will happen/i,
  /it will definitely be fine/i,
  /guaranteed/i,
];

export const validateNoReassurance = (message: string): boolean =>
  !REASSURANCE_BANNED_PATTERNS.some((pattern) => pattern.test(message));

export const buildErpCoachingMessage = (session: ExposureSession, sudsLogs: SUDSLog[]): string => {
  const sorted = [...sudsLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const first = sorted[0]?.suds ?? session.preSuds;
  const last = sorted[sorted.length - 1]?.suds ?? session.postSuds ?? session.preSuds;

  let message = COACHING_TEMPLATES.holdSteady;

  if (last < first) {
    message = COACHING_TEMPLATES.anxietyDrop.replace("{from}", String(first)).replace("{to}", String(last));
  }

  if (session.compulsionResistanceCount > 0) {
    message = COACHING_TEMPLATES.ritualResisted.replace("{count}", String(session.compulsionResistanceCount));
  }

  if (!validateNoReassurance(message)) {
    return "Stay with uncertainty and continue response prevention for one more minute.";
  }

  return message;
};

export const shouldMarkMastery = (
  sessions: ExposureSession[],
  masteryThresholdSessions: number,
): boolean => {
  const completed = sessions.filter((entry) => entry.completed && typeof entry.postSuds === "number");
  const latest = completed.slice(-masteryThresholdSessions);
  return latest.length >= masteryThresholdSessions && latest.every((entry) => (entry.postSuds ?? 100) < 30);
};
