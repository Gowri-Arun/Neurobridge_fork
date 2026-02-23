import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Shield, Waves, Sparkles, ListChecks, NotebookPen, Wind, Send } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./OCDDashboard.module.css";

const OCD_SCREENS = [
  { id: "wave", label: "Wave-Rider", icon: Waves },
  { id: "defusion", label: "Defusion", icon: Sparkles },
  { id: "ladder", label: "ERP Ladder", icon: ListChecks },
  { id: "journal", label: "Journal", icon: NotebookPen },
];

const REASSURANCE_PATTERNS = [
  /will i be okay\??/i,
  /am i safe\??/i,
  /did i do it right\??/i,
  /can you promise/i,
  /is everything fine\??/i,
];

const initialExposures = [
  { id: 1, text: "Leave one item slightly misaligned for 60 seconds", done: false },
  { id: 2, text: "Delay one checking ritual by 2 minutes", done: false },
  { id: 3, text: "Touch a low-trigger surface and pause for one breath", done: false },
];

const formatTimer = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remaining = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
};

const reassureAwareReply = (entry) => {
  if (REASSURANCE_PATTERNS.some((pattern) => pattern.test(entry))) {
    return "That is an uncertainty we are learning to live with.";
  }
  return "Notice the thought, name the feeling, and return to your chosen action.";
};

export default function OCDDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("wave");

  const [waveActive, setWaveActive] = useState(false);
  const [waveSeconds, setWaveSeconds] = useState(180);

  const [thoughtInput, setThoughtInput] = useState("");
  const [thoughtBalloon, setThoughtBalloon] = useState("");
  const [balloonDetached, setBalloonDetached] = useState(false);

  const [microExposure, setMicroExposure] = useState("");
  const [exposures, setExposures] = useState(initialExposures);

  const [journalInput, setJournalInput] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!waveActive || waveSeconds <= 0) {
      return;
    }

    const id = setInterval(() => {
      setWaveSeconds((previous) => {
        if (previous <= 1) {
          setWaveActive(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [waveActive, waveSeconds]);

  const liquidHeight = useMemo(() => {
    const progress = ((180 - waveSeconds) / 180) * 100;
    return Math.min(100, Math.max(10, progress));
  }, [waveSeconds]);

  const completedSteps = exposures.filter((item) => item.done).length;

  const toggleExposure = (id) => {
    setExposures((previous) =>
      previous.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );

    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([8, 18, 8]);
    }
  };

  const addExposure = () => {
    if (!microExposure.trim()) {
      return;
    }

    setExposures((previous) => [
      ...previous,
      {
        id: Date.now(),
        text: microExposure.trim(),
        done: false,
      },
    ]);
    setMicroExposure("");
  };

  const createBalloon = () => {
    if (!thoughtInput.trim()) {
      return;
    }
    setThoughtBalloon(`I am having the thought that ${thoughtInput.trim()}.`);
    setBalloonDetached(false);
  };

  const releaseBalloon = () => {
    setBalloonDetached(true);
  };

  const addJournalEntry = () => {
    if (!journalInput.trim()) {
      return;
    }

    const content = journalInput.trim();
    const reply = reassureAwareReply(content);

    setJournalEntries((previous) => [
      {
        id: Date.now(),
        content,
        reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...previous,
    ]);

    setJournalInput("");
  };

  return (
    <div className={styles.appShell}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Modes
        </Link>
      </div>

      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.heroIcon}>
          <Shield size={24} />
        </div>
        <div>
          <h1>MindBridge</h1>
          <p>The Safe Space — gentle, non-triggering support for uncertainty and resistance.</p>
        </div>
      </motion.section>

      <nav className={styles.screenTabs} aria-label="MindBridge workspace screens">
        {OCD_SCREENS.map((screen) => {
          const Icon = screen.icon;
          const selected = activeScreen === screen.id;
          return (
            <button
              key={screen.id}
              className={styles.tabButton}
              onClick={() => setActiveScreen(screen.id)}
              aria-pressed={selected}
            >
              {selected && <motion.span layoutId="ocd-tab-highlight" className={styles.tabHighlight} />}
              <Icon size={16} />
              <span>{screen.label}</span>
            </button>
          );
        })}
      </nav>

      {loading ? (
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeScreen === "wave" && (
            <motion.section
              key="wave"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <Wind size={18} />
                <h2>Wave-Rider Timer</h2>
              </header>

              <p className={styles.helper}>Press "Ride the Wave" and follow the liquid breath rhythm for 3 minutes.</p>

              <div className={styles.liquidFrame} role="img" aria-label={`Urge surfing timer at ${formatTimer(waveSeconds)}`}>
                <div className={styles.liquidTimer}>{formatTimer(waveSeconds)}</div>
                <motion.div
                  className={styles.liquidSurface}
                  animate={{ height: `${liquidHeight}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <motion.svg viewBox="0 0 300 80" className={styles.liquidWave} preserveAspectRatio="none">
                    <motion.path
                      d="M0,40 C35,20 70,20 105,40 C140,60 175,60 210,40 C245,20 280,20 315,40 L315,80 L0,80 Z"
                      animate={{ x: [0, -50, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.svg>
                </motion.div>
              </div>

              <div className={styles.waveActions}>
                <button
                  className={styles.primaryAction}
                  onClick={() => {
                    if (!waveActive && waveSeconds === 0) {
                      setWaveSeconds(180);
                    }
                    setWaveActive((value) => !value);
                  }}
                >
                  {waveActive ? "Pause" : "Ride the Wave"}
                </button>
                <button
                  className={styles.secondaryAction}
                  onClick={() => {
                    setWaveActive(false);
                    setWaveSeconds(180);
                  }}
                >
                  Reset
                </button>
              </div>
            </motion.section>
          )}

          {activeScreen === "defusion" && (
            <motion.section
              key="defusion"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <Sparkles size={18} />
                <h2>Cognitive Defusion Workspace</h2>
              </header>

              <label htmlFor="thoughtBalloon" className={styles.label}>Intrusive thought</label>
              <textarea
                id="thoughtBalloon"
                className={styles.textInput}
                value={thoughtInput}
                onChange={(event) => setThoughtInput(event.target.value)}
                placeholder="Write the thought exactly as it appears..."
              />

              <div className={styles.inlineActions}>
                <button className={styles.primaryAction} onClick={createBalloon}>Create Thought Balloon</button>
                <button className={styles.secondaryAction} onClick={releaseBalloon}>Let It Float Away</button>
              </div>

              <div className={styles.balloonStage} aria-live="polite">
                {thoughtBalloon ? (
                  <motion.div
                    className={styles.balloon}
                    drag
                    dragElastic={0.4}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={
                      balloonDetached
                        ? {
                            y: [-10, -180],
                            x: [0, 14, -12, 20],
                            opacity: [1, 1, 0.2],
                            scale: [1, 1.05, 0.95],
                          }
                        : {
                            y: [0, -6, 0],
                            rotate: [0, 1.5, -1.5, 0],
                          }
                    }
                    transition={{ duration: balloonDetached ? 4.2 : 3, repeat: balloonDetached ? 0 : Infinity }}
                  >
                    <p>{thoughtBalloon}</p>
                    <span>Drag to observe, not obey.</span>
                  </motion.div>
                ) : (
                  <p className={styles.emptyHint}>Your thought balloon appears here.</p>
                )}
              </div>
            </motion.section>
          )}

          {activeScreen === "ladder" && (
            <motion.section
              key="ladder"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <ListChecks size={18} />
                <h2>ERP Exposure Ladder</h2>
              </header>

              <div className={styles.ladderTop}>
                <div>
                  <strong>{completedSteps}/{exposures.length}</strong>
                  <span> Micro-exposures completed</span>
                </div>
                <div className={styles.softHaptic}>Soft Success haptics enabled</div>
              </div>

              <div className={styles.stepper}>
                {exposures.map((item, index) => (
                  <div key={item.id} className={styles.stepRow}>
                    <button
                      className={`${styles.stepDot} ${item.done ? styles.stepDone : ""}`}
                      onClick={() => toggleExposure(item.id)}
                      aria-label={`Mark exposure ${index + 1} as ${item.done ? "not completed" : "completed"}`}
                    >
                      {index + 1}
                    </button>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>

              <div className={styles.exposureComposer}>
                <input
                  className={styles.textInput}
                  value={microExposure}
                  onChange={(event) => setMicroExposure(event.target.value)}
                  placeholder='Add micro-exposure: "Delay hand washing for 2 minutes"'
                />
                <button className={styles.primaryAction} onClick={addExposure}>Add Step</button>
              </div>
            </motion.section>
          )}

          {activeScreen === "journal" && (
            <motion.section
              key="journal"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <NotebookPen size={18} />
                <h2>Anti-Reassurance Journal</h2>
              </header>

              <label htmlFor="journalInput" className={styles.label}>Thought or question</label>
              <textarea
                id="journalInput"
                className={styles.textInput}
                value={journalInput}
                onChange={(event) => setJournalInput(event.target.value)}
                placeholder="Write what your mind is asking right now..."
              />

              <button className={styles.primaryAction} onClick={addJournalEntry}>
                <Send size={16} />
                Process Entry
              </button>

              <div className={styles.journalFeed}>
                {journalEntries.length === 0 && <p className={styles.emptyHint}>Entries appear here with uncertainty-first responses.</p>}
                {journalEntries.map((entry) => (
                  <article key={entry.id} className={styles.journalCard}>
                    <div className={styles.journalMeta}>{entry.timestamp}</div>
                    <p className={styles.journalUser}>{entry.content}</p>
                    <p className={styles.journalReply}>{entry.reply}</p>
                  </article>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {waveActive && (
          <motion.div
            className={styles.dimmingLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
