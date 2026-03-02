import { describe, expect, it } from "vitest";
import { buildWeeklyInsight, inferSubtype } from "../ai/journalAnalyzer";
import { sampleJournalEntries } from "./sampleData";

describe("Journal AI analysis", () => {
  it("infers subtype using local keyword rules", () => {
    expect(inferSubtype("I need to wash after touching this")).toBe("contamination");
  });

  it("builds weekly insight with risk windows", () => {
    const insight = buildWeeklyInsight(sampleJournalEntries, "2026-03-02");
    expect(insight.highestRiskWindows.length).toBeGreaterThan(0);
    expect(typeof insight.narrative).toBe("string");
  });
});
