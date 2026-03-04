/**
 * DisorderSelection.jsx  —  Post-login disorder review & update screen.
 *
 * Shown on EVERY login so users can review and adjust the areas they want
 * support with before entering the app.  Pre-filled with their current plan.
 *
 * Clinical safety rules:
 *  • Language never says "you HAVE X disorder"
 *  • Phrasing: "select the areas you’d like support with"
 *  • No diagnosis reinforcement
 *  • "Not sure" option → gets a balanced default set
 *
 * Enhancement:
 *  • Optional ML-backed questionnaire that sends answers to /api/assessment
 *    and gets back suggested support areas (module keys matching ALL_DISORDERS).
 *  • Uses suggestions only to pre-select modules; user can always change them.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Brain,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ALL_DISORDERS, DISORDER_META } from "@/lib/disorders";

// Questionnaire definition (frontend only: ML is on backend)
/**
 * Each question maps to a numeric answer 0–4.
 * The frontend just collects a vector like:
 * { mood_sad: 3, mood_hopeless: 2, ... }
 * and sends it to /api/assessment for ML scoring.
 */
const QUESTIONNAIRE = [
  // Mood
  { id: "mood_sad", text: "How often do you feel sad or empty?", category: "mood" },
  { id: "mood_hopeless", text: "How often do you feel hopeless about the future?", category: "mood" },
  { id: "mood_irritable", text: "How often do you feel more irritable than usual?", category: "mood" },
  { id: "interest_loss", text: "How often do you lose interest in activities you usually enjoy?", category: "mood" },

  // Anxiety
  { id: "worry_excess", text: "How often do you worry more than you feel you should?", category: "anxiety" },
  { id: "panic_symptoms", text: "How often do you experience sudden rushes of fear, panic or discomfort?", category: "anxiety" },
  { id: "restlessness", text: "How often do you feel restless or on edge?", category: "anxiety" },

  // Cognitive
  { id: "focus_issues", text: "How often do you struggle to concentrate on tasks?", category: "cognitive" },
  { id: "memory_lapses", text: "How often do you notice lapses in your memory (forgetting recent things)?", category: "cognitive" },
  { id: "decision_difficulty", text: "How often do decisions feel harder than they should?", category: "cognitive" },

  // Physical / sleep
  { id: "fatigue", text: "How often do you feel physically drained or exhausted?", category: "physical" },
  { id: "sleep_problems", text: "How often do you have trouble falling or staying asleep?", category: "physical" },
  { id: "appetite_change", text: "How often do you notice changes in appetite (more or less than usual)?", category: "physical" },
];

const SEVERITY_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Almost always" },
];

export default function DisorderSelection() {
  const { updateDisorders, disorders: savedDisorders } = useAuth();
  const navigate = useNavigate();

  // Manual selection state (original)
  const [selected, setSelected] = useState(() => new Set(savedDisorders ?? []));
  const [saving, setSaving] = useState(false);

  // Questionnaire / ML state
  const [showAssessment, setShowAssessment] = useState(false);
  const [qStep, setQStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState("");
  const [mlSuggestions, setMlSuggestions] = useState([]); // array of disorder keys

  // Decide if we should show assessment automatically for new users
  useEffect(() => {
    const hasSaved = !!savedDisorders?.length;
    const assessmentDone = localStorage.getItem("assessment_done") === "1";

    if (!hasSaved && !assessmentDone) {
      setShowAssessment(true);
    }
  }, [savedDisorders]);

  // Original toggle
  function toggle(disorder) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(disorder) ? next.delete(disorder) : next.add(disorder);
      return next;
    });
  }

  // Original continue
  async function handleContinue() {
    if (selected.size === 0) return;
    setSaving(true);
    await updateDisorders([...selected]);
    const first = [...selected][0];
    const path = DISORDER_META[first]?.path ?? "/";
    navigate(path, { replace: true });
  }

  // Original "Not sure"
  async function handleNotSure() {
    setSaving(true);
    await updateDisorders(ALL_DISORDERS);
    navigate("/", { replace: true });
  }

  // Questionnaire handlers
  const currentQuestion = QUESTIONNAIRE[qStep];
  const progress = ((qStep + 1) / QUESTIONNAIRE.length) * 100;

  function handleAnswer(value) {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);
    setMlError("");

    if (qStep < QUESTIONNAIRE.length - 1) {
      setQStep((prev) => prev + 1);
    } else {
      // Last question → call ML backend
      submitToML(updated);
    }
  }

  function goBackOne() {
    if (qStep === 0) return;
    setQStep((prev) => prev - 1);
  }

  async function submitToML(answerVector) {
    try {
      setMlLoading(true);
      setMlError("");

      /**
       * Backend contract (example):
       * POST /api/assessment
       * body: { answers: { [id]: 0-4 } }
       * response: { suggestions: string[] } // array of disorder keys from ALL_DISORDERS
       */
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerVector }),
      });

      if (!res.ok) {
        throw new Error("Assessment service unavailable");
      }

      const data = await res.json();
      const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];

      // Filter to only known disorders
      const validSuggestions = suggestions.filter((key) =>
        ALL_DISORDERS.includes(key)
      );

      setMlSuggestions(validSuggestions);
      setSelected(new Set(validSuggestions));
      localStorage.setItem("assessment_done", "1");
      setShowAssessment(false);
    } catch (err) {
      console.error("ML assessment error", err);
      setMlError(
        "We couldn't complete the smart assessment right now. You can still choose areas manually."
      );
      // Fallback: close assessment but keep manual selection empty for user to pick
      localStorage.setItem("assessment_done", "1");
      setShowAssessment(false);
    } finally {
      setMlLoading(false);
    }
  }

  function skipAssessment() {
    localStorage.setItem("assessment_done", "1");
    setShowAssessment(false);
  }

  // Assessment screen
  if (showAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-white/60">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex w-14 h-14 bg-gradient-to-r from-primary to-purple-500 rounded-2xl items-center justify-center mb-3 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Smart support setup</h1>
            <p className="text-xs text-gray-500 mt-1">
              Answer a few questions to tailor the areas you might want support with.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4 pb-2 bg-white/60">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Question {qStep + 1} of {QUESTIONNAIRE.length}
          </p>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-xl border border-white/60">
              <div className="text-center mb-6">
                <div
                  className={`inline-flex w-12 h-12 rounded-xl items-center justify-center mb-3 ${
                    currentQuestion.category === "mood"
                      ? "bg-blue-100"
                      : currentQuestion.category === "anxiety"
                      ? "bg-purple-100"
                      : currentQuestion.category === "cognitive"
                      ? "bg-indigo-100"
                      : "bg-rose-100"
                  }`}
                >
                  <Brain className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {currentQuestion.text}
                </h2>
                <p className="text-xs text-gray-500">
                  Think about roughly the past 2 weeks.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SEVERITY_OPTIONS.map((opt) => {
                  const selectedValue = answers[currentQuestion.id];
                  const isActive = selectedValue === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleAnswer(opt.value)}
                      className={`relative p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-md"
                          : "border-gray-200 bg-white hover:border-primary/60 hover:bg-primary/5"
                      }`}
                    >
                      {isActive && (
                        <Check className="w-4 h-4 text-primary absolute top-1 right-1" />
                      )}
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {mlError && (
              <p className="mt-4 text-xs text-red-600 text-center">{mlError}</p>
            )}
          </motion.div>
        </div>

        {/* Bottom actions */}
        <div className="p-6 space-y-3 bg-white/80 backdrop-blur-sm">
          <button
            onClick={skipAssessment}
            className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Skip for now (choose areas manually)
          </button>
          <button
            onClick={goBackOne}
            disabled={qStep === 0}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous question
          </button>
          {mlLoading && (
            <p className="text-xs text-gray-500 text-center">
              Analysing your responses…
            </p>
          )}
        </div>
      </div>
    );
  }

  // ORIGINAL manual selection UI (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your support plan</h1>
          <p className="mt-2 text-gray-500 text-sm max-w-md mx-auto">
            Select the areas you’d like support with today. Your sidebar and
            home screen will show only these tools.
          </p>

          {/* Entry point for assessment if user skipped earlier */}
          {!localStorage.getItem("assessment_done") && (
            <button
              onClick={() => setShowAssessment(true)}
              className="mt-3 inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Try a quick smart questionnaire
            </button>
          )}

          {savedDisorders?.length > 0 && (
            <p className="mt-1 text-xs text-primary font-medium">
              Previously selected: {savedDisorders.length} area
              {savedDisorders.length > 1 ? "s" : ""} — adjust freely and hit
              Continue.
            </p>
          )}
        </div>

        {/* Disorder grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {ALL_DISORDERS.map((disorder) => {
            const meta = DISORDER_META[disorder];
            const Icon = meta.icon;
            const isOn = selected.has(disorder);
            return (
              <motion.button
                key={disorder}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(disorder)}
                className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                  isOn
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <AnimatePresence>
                  {isOn && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.color} bg-opacity-15`}
                >
                  <Icon className={`w-5 h-5 ${meta.accent}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {meta.label}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {meta.subtitle}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selection count hint */}
        <p className="text-center text-xs text-gray-400 mb-4">
          {selected.size === 0
            ? "Select at least one area to continue"
            : `${selected.size} area${
                selected.size > 1 ? "s" : ""
              } selected — you can change this anytime in Settings`}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleContinue}
            disabled={selected.size === 0 || saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : "Continue"}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>
          <button
            onClick={handleNotSure}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 px-5 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> Not sure yet
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          This selection is stored only on your device and is never shared
          without your consent.
        </p>
      </motion.div>
    </div>
  );
}
