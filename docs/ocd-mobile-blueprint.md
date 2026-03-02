# OCD ERP Mobile App Blueprint (Local-first, Privacy-first)

## 1) Component Structure

```text
mobile/src/
  AppShell.tsx
  constants/
    copy.ts
  types/
    ocd.ts
  state/
    useOcdStore.ts
  storage/
    encryptedStorage.ts
    sqliteRepository.ts
  ai/
    erpCoach.ts
    journalAnalyzer.ts
    goalEngine.ts
  features/
    erp/ERPExposureTracker.tsx
    journal/ThoughtTriggerJournal.tsx
    goals/ResponsePreventionGoals.tsx
    mindfulness/MindfulnessInterruptions.tsx
    dashboard/SymptomProgressDashboard.tsx
    dashboard/chartConfigs.ts
  services/
    therapistExport.ts
  test/
    sampleData.ts
    erpCoach.test.ts
    journalAnalyzer.test.ts
```

## 2) Clinical Guardrails Implemented

- No reassurance phrase policy (`validateNoReassurance` in `ai/erpCoach.ts`)
- No safety behavior prompts in UX copy
- Habituation-focused coaching from observed SUDS deltas only
- Mastery gated progression (post-SUDS < 30 for `N` completed sessions)
- Compassionate resets without shame language

## 3) State + Logic

Store is in `state/useOcdStore.ts` (Zustand) with slices for:

- ERP hierarchies, items, sessions, SUDS logs, resistance logs
- Journal entries + subtype inference
- Response prevention goals (adaptive)
- Mindfulness run tracking
- Weekly insights for dashboard narratives

Key actions:

- `completeSession(sessionId, postSuds)` returns ERP-safe coaching copy
- `refreshGoals()` generates SMART micro-goals from local behavior patterns
- `buildWeekly(weekOf)` computes trend/risk summary for dashboard and export

## 4) Data Models

Typed interfaces include all required schemas in `types/ocd.ts`:

- `ExposureHierarchy`
- `ExposureItem`
- `ExposureSession`
- `SUDSLog`
- `CompulsionResistanceLog`

Plus:

- `ThoughtTriggerJournalEntry`
- `ResponsePreventionGoal`
- `MindfulnessSessionTemplate` / `MindfulnessSessionRun`
- `WeeklyInsight`

## 5) Local-First + Privacy Architecture

- Default local-only storage
- AES encryption adapter (`storage/encryptedStorage.ts`)
- SQLite schema contracts (`storage/sqliteRepository.ts`)
- Explicit therapist export consent gate (`consentGatedExport` + `buildTherapistPdf`)
- No cloud sync by default

## 6) Charts + Insight Output

Chart config presets in `features/dashboard/chartConfigs.ts` cover:

- Symptom intensity trend line
- Compulsion frequency by subtype
- ERP success rate over weeks
- Pre-vs-post SUDS comparisons

AI narratives include clinically aligned examples:

- "Anxiety moved from 80 to 50. Stay with uncertainty for one more minute."
- "Most urgent windows appear around 19:00, 20:00. Consider pre-planned interruptions."

## 7) Accessibility + Mobile UX Requirements

Implemented in baseline shell and component patterns:

- Dark theme baseline (`AppShell.tsx`)
- Large touch targets (`minHeight >= 56`)
- Haptic-ready event points (wire with `expo-haptics`)
- Voice command/voice-to-text extension points (wire with OS speech APIs)
- Crisis disclaimer + non-replacement-for-therapy disclaimer

## 8) Optional Consent-Gated Features

- GPS-based trigger logging via Expo Location (explicit prompt + in-app toggle)
- Therapist PDF export via `pdf-lib`
- Home widget support (platform plugin required)

## 9) Suggested Expo Dependencies

```bash
expo install expo-sqlite expo-secure-store expo-haptics expo-location expo-av
npm i zustand crypto-js pdf-lib victory-native react-native-svg
```

## 10) Test Coverage Included

- `erpCoach.test.ts`: reassurance filter + mastery logic + coaching safety
- `journalAnalyzer.test.ts`: subtype inference + risk window insight generation
- `sampleData.ts`: realistic ERP/journal seed data

## 11) Clinical Safety Notes

- This app is a skill-support tool, not emergency or diagnostic care.
- Crisis pathways must always be one tap away.
- AI output must remain uncertainty-tolerant and behaviorally focused.
