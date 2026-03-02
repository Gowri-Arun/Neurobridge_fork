import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wind, ListChecks, NotebookPen, Plus } from "lucide-react";

const BREATH_CYCLE_SECONDS = 16;

const initialGroundingChecks = [
  { id: 1, label: "Name 5 things you can see", done: false },
  { id: 2, label: "Name 4 things you can feel", done: false },
  { id: 3, label: "Name 3 things you can hear", done: false },
  { id: 4, label: "Name 2 things you can smell", done: false },
  { id: 5, label: "Name 1 thing you can taste", done: false },
];

const formatClock = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const getBreathPhase = (tick) => {
  const step = tick % BREATH_CYCLE_SECONDS;
  if (step < 4) {
    return "Inhale";
  }
  if (step < 8) {
    return "Hold";
  }
  if (step < 12) {
    return "Exhale";
  }
  return "Hold";
};

export default function AnxietyPage() {
  const [sessionMinutes, setSessionMinutes] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [groundingChecks, setGroundingChecks] = useState(initialGroundingChecks);

  const [worryInput, setWorryInput] = useState("");
  const [planInput, setPlanInput] = useState("");
  const [journalEntries, setJournalEntries] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const saved = window.localStorage.getItem("anxiety-journal-entries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          return 0;
        }
        return previous - 1;
      });
      setElapsed((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("anxiety-journal-entries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  const breathPhase = useMemo(() => getBreathPhase(elapsed), [elapsed]);
  const completedGrounding = groundingChecks.filter((item) => item.done).length;

  const startOrPause = () => {
    if (!isRunning && secondsLeft === 0) {
      const next = sessionMinutes * 60;
      setSecondsLeft(next);
      setElapsed(0);
    }
    setIsRunning((value) => !value);
  };

  const resetSession = () => {
    setIsRunning(false);
    setElapsed(0);
    setSecondsLeft(sessionMinutes * 60);
  };

  const toggleGroundingCheck = (id) => {
    setGroundingChecks((previous) =>
      previous.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  const addJournalEntry = () => {
    const worry = worryInput.trim();
    const plan = planInput.trim();
    if (!worry || !plan) {
      return;
    }

    setJournalEntries((previous) => [
      {
        id: Date.now(),
        worry,
        plan,
        time: new Date().toLocaleString(),
      },
      ...previous,
    ]);

    setWorryInput("");
    setPlanInput("");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <Link to="/" className="neuro-btn-ghost text-sm gap-2 inline-flex min-h-0 py-2 px-3">
        <ArrowLeft size={16} />
        Back to Modes
      </Link>

      <section className="neuro-card p-5 space-y-2">
        <h1 className="text-3xl font-bold">Anxiety Toolkit</h1>
        <p className="text-muted-foreground">
          Real-time breathing, grounding, and a thought-to-plan journal for anxious moments.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neuro-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Wind size={18} />
            <h2 className="text-xl font-semibold">Guided Breathing</h2>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="sessionMinutes" className="text-sm text-muted-foreground">Session</label>
            <select
              id="sessionMinutes"
              className="neuro-input max-w-32"
              value={sessionMinutes}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSessionMinutes(value);
                setIsRunning(false);
                setElapsed(0);
                setSecondsLeft(value * 60);
              }}
            >
              <option value={2}>2 minutes</option>
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes</option>
            </select>
          </div>

          <div className="rounded-2xl border p-6 text-center bg-background/50 space-y-2">
            <p className="text-sm text-muted-foreground">Current phase</p>
            <p className="text-2xl font-bold">{breathPhase}</p>
            <p className="text-4xl font-bold tracking-tight">{formatClock(secondsLeft)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="neuro-btn-primary" onClick={startOrPause}>
              {isRunning ? "Pause" : "Start"}
            </button>
            <button className="neuro-btn-outline" onClick={resetSession}>Reset</button>
          </div>
        </div>

        <div className="neuro-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks size={18} />
            <h2 className="text-xl font-semibold">5-4-3-2-1 Grounding</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Completed {completedGrounding}/{groundingChecks.length}
          </p>

          <div className="space-y-2">
            {groundingChecks.map((item) => (
              <button
                key={item.id}
                className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                  item.done ? "bg-primary/10 border-primary" : "bg-background/60"
                }`}
                onClick={() => toggleGroundingCheck(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="neuro-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <NotebookPen size={18} />
          <h2 className="text-xl font-semibold">Thought-to-Plan Journal</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <textarea
            className="neuro-input min-h-28"
            placeholder="What worry is active right now?"
            value={worryInput}
            onChange={(event) => setWorryInput(event.target.value)}
          />
          <textarea
            className="neuro-input min-h-28"
            placeholder="What is one realistic next step you can take?"
            value={planInput}
            onChange={(event) => setPlanInput(event.target.value)}
          />
        </div>

        <button className="neuro-btn-primary inline-flex items-center gap-2" onClick={addJournalEntry}>
          <Plus size={16} />
          Save Entry
        </button>

        <div className="space-y-2">
          {journalEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No entries yet. Add your first thought-to-plan step.</p>
          )}
          {journalEntries.map((entry) => (
            <article key={entry.id} className="rounded-xl border p-3 bg-background/40">
              <p className="text-xs text-muted-foreground mb-2">{entry.time}</p>
              <p className="font-medium">Worry: {entry.worry}</p>
              <p className="text-sm mt-1">Plan: {entry.plan}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
