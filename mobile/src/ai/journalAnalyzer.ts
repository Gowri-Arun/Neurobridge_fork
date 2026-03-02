import type { OCDSubtype, ThoughtTriggerJournalEntry, WeeklyInsight } from "../types/ocd";

const KEYWORDS: Record<OCDSubtype, string[]> = {
  contamination: ["dirty", "germs", "wash", "contaminated"],
  checking: ["check", "locked", "stove", "mistake"],
  symmetry: ["even", "aligned", "symmetry", "exact"],
  harm: ["hurt", "harm", "violent", "accident"],
  scrupulosity: ["sin", "blasphemy", "moral", "guilt"],
  relationship: ["partner", "love", "relationship", "doubt"],
  somatic: ["illness", "body", "health", "symptom"],
  other: [],
};

export const inferSubtype = (text: string): OCDSubtype => {
  const lower = text.toLowerCase();
  for (const [subtype, words] of Object.entries(KEYWORDS) as [OCDSubtype, string[]][]) {
    if (words.some((word) => lower.includes(word))) {
      return subtype;
    }
  }
  return "other";
};

export const detectHighRiskWindows = (entries: ThoughtTriggerJournalEntry[]) => {
  const hourly = new Map<number, { urgencyTotal: number; count: number }>();

  entries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    const current = hourly.get(hour) ?? { urgencyTotal: 0, count: 0 };
    current.urgencyTotal += entry.urgency;
    current.count += 1;
    hourly.set(hour, current);
  });

  return [...hourly.entries()]
    .map(([hour, stats]) => ({
      hour,
      confidence: Number((stats.urgencyTotal / (stats.count * 10)).toFixed(2)),
      reason: "Elevated urgency logs in this window",
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
};

export const buildWeeklyInsight = (entries: ThoughtTriggerJournalEntry[], weekOf: string): WeeklyInsight => {
  const subtypeMix: WeeklyInsight["subtypeMix"] = {
    contamination: 0,
    checking: 0,
    symmetry: 0,
    harm: 0,
    scrupulosity: 0,
    relationship: 0,
    somatic: 0,
    other: 0,
  };

  entries.forEach((entry) => {
    subtypeMix[entry.subtypeGuess ?? "other"] += 1;
  });

  const highRiskWindows = detectHighRiskWindows(entries);

  const moodValues = entries.map((entry) => entry.moodScore);
  const urgencyValues = entries.map((entry) => entry.urgency);
  const moodCompulsionCorrelation = pearson(moodValues, urgencyValues);

  const narrative =
    highRiskWindows.length > 0
      ? `Most urgent windows appear around ${highRiskWindows.map((window) => `${window.hour}:00`).join(", ")}. Consider pre-planned interruptions.`
      : "Data is limited this week. Continue logging to refine insights.";

  return {
    weekOf,
    subtypeMix,
    moodCompulsionCorrelation,
    highestRiskWindows: highRiskWindows,
    narrative,
  };
};

const pearson = (x: number[], y: number[]): number => {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
  const xMean = x.reduce((sum, value) => sum + value, 0) / x.length;
  const yMean = y.reduce((sum, value) => sum + value, 0) / y.length;

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  for (let index = 0; index < x.length; index += 1) {
    const xDelta = x[index] - xMean;
    const yDelta = y[index] - yMean;
    numerator += xDelta * yDelta;
    xDenominator += xDelta * xDelta;
    yDenominator += yDelta * yDelta;
  }

  const denominator = Math.sqrt(xDenominator * yDenominator);
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
};
