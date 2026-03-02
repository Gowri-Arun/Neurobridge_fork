import { describe, expect, it } from "vitest";
import { buildErpCoachingMessage, shouldMarkMastery, validateNoReassurance } from "../ai/erpCoach";
import { sampleSessions } from "./sampleData";

describe("ERP coaching safety", () => {
  it("blocks reassurance phrases", () => {
    expect(validateNoReassurance("you are safe now")).toBe(false);
    expect(validateNoReassurance("stay with uncertainty")).toBe(true);
  });

  it("marks mastery only after repeated low post-SUDS sessions", () => {
    expect(shouldMarkMastery(sampleSessions, 3)).toBe(true);
    expect(shouldMarkMastery(sampleSessions.slice(0, 2), 3)).toBe(false);
  });

  it("returns non-reassuring coaching message", () => {
    const message = buildErpCoachingMessage(sampleSessions[0], [
      { id: "l1", sessionId: "s1", timestamp: new Date().toISOString(), suds: 70 },
      { id: "l2", sessionId: "s1", timestamp: new Date().toISOString(), suds: 45 },
      { id: "l3", sessionId: "s1", timestamp: new Date().toISOString(), suds: 30 },
    ]);

    expect(validateNoReassurance(message)).toBe(true);
  });
});
