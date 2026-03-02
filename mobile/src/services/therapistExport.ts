import { PDFDocument, StandardFonts } from "pdf-lib";
import type { ExposureSession, ThoughtTriggerJournalEntry, WeeklyInsight } from "../types/ocd";

interface ExportPayload {
  sessions: ExposureSession[];
  journalEntries: ThoughtTriggerJournalEntry[];
  weeklyInsight?: WeeklyInsight;
  consentGiven: boolean;
}

export const buildTherapistPdf = async (payload: ExportPayload): Promise<Uint8Array> => {
  if (!payload.consentGiven) {
    throw new Error("Explicit user consent required before therapist export.");
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 800]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("OCD ERP Progress Export", { x: 50, y: 760, size: 18, font });
  page.drawText(`Sessions logged: ${payload.sessions.length}`, { x: 50, y: 730, size: 12, font });
  page.drawText(`Journal entries: ${payload.journalEntries.length}`, { x: 50, y: 710, size: 12, font });

  if (payload.weeklyInsight) {
    page.drawText(`Narrative: ${payload.weeklyInsight.narrative}`, { x: 50, y: 680, size: 10, font, maxWidth: 500 });
  }

  page.drawText("Clinical note: This report does not provide reassurance content.", { x: 50, y: 640, size: 10, font });
  return pdf.save();
};
