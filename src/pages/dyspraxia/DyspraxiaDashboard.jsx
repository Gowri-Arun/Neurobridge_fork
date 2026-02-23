import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Hand,
  Play,
  Pause,
  Repeat,
  Turtle,
  FlipHorizontal2,
  MapPinned,
  Building2,
  ArrowBigUpDash,
} from "lucide-react";
import styles from "./DyspraxiaDashboard.module.css";

const COORDI_SCREENS = [
  { id: "giant", label: "Giant Tap" },
  { id: "aomi", label: "AOMI Player" },
  { id: "rhythm", label: "Rhythm" },
  { id: "nav", label: "Landmark AR" },
];

const skillVideos = [
  { id: "vid-1", title: "Tying a Tie", cue: "Cross, tuck, pull through." },
  { id: "vid-2", title: "Packing a Backpack", cue: "Heavy items at the back panel." },
  { id: "vid-3", title: "Buttoning a Shirt", cue: "Anchor fabric, then press through." },
];

const landmarks = [
  { id: 1, icon: Building2, text: "Turn at the Big Yellow Sign" },
  { id: 2, icon: MapPinned, text: "Continue until the Blue Bus Stop" },
  { id: 3, icon: Building2, text: "Stop by the Red Building Entrance" },
];

export default function DyspraxiaDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("giant");

  const [selectedVideo, setSelectedVideo] = useState(skillVideos[0].id);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [loopSegment, setLoopSegment] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [bpm, setBpm] = useState(60);
  const [rhythmRunning, setRhythmRunning] = useState(false);
  const [beatPulse, setBeatPulse] = useState(0);
  const [beatWord, setBeatWord] = useState("1");

  const [arOverlay, setArOverlay] = useState(false);

  const giantButtonsRef = useRef([]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!rhythmRunning) {
      return;
    }

    const intervalMs = Math.max(280, Math.floor((60 / bpm) * 1000));
    let toggle = false;

    const id = setInterval(() => {
      toggle = !toggle;
      setBeatPulse((value) => value + 1);
      setBeatWord(toggle ? "1" : "2");
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(toggle ? [70, 90, 70] : [120]);
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [rhythmRunning, bpm]);

  const activeVideo = useMemo(
    () => skillVideos.find((item) => item.id === selectedVideo) ?? skillVideos[0],
    [selectedVideo],
  );

  const handleGhostTap = (event) => {
    const target = event.target;

    if (target.closest("button")) {
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    giantButtonsRef.current.forEach((button) => {
      if (!button) {
        return;
      }
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(centerX - x, centerY - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = button;
      }
    });

    if (nearest && nearestDistance <= 20) {
      nearest.focus();
      nearest.click();
    }
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
          <Hand size={24} />
        </div>
        <div>
          <h1>CoordiMate</h1>
          <p>The Frictionless Path — fumble-proof controls and motor-friendly guidance.</p>
        </div>
      </motion.section>

      <nav className={styles.screenTabs} aria-label="CoordiMate screens">
        {COORDI_SCREENS.map((screen) => (
          <button
            key={screen.id}
            className={styles.tabButton}
            onClick={() => setActiveScreen(screen.id)}
            aria-pressed={activeScreen === screen.id}
          >
            {activeScreen === screen.id && <motion.span layoutId="dysp-tab-highlight" className={styles.tabHighlight} />}
            <span>{screen.label}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeScreen === "giant" && (
            <motion.section
              key="giant"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onPointerDown={handleGhostTap}
            >
              <header className={styles.cardHeader}>
                <h2>Giant-Tap Architecture</h2>
              </header>
              <p className={styles.helper}>Tap anywhere close (within 20px) and the action snaps to the nearest card.</p>

              <div className={styles.giantGrid}>
                {[
                  { id: "aomi", text: "Open AOMI Player" },
                  { id: "rhythm", text: "Open Haptic Rhythm" },
                  { id: "nav", text: "Open Landmark AR" },
                ].map((item, index) => (
                  <button
                    key={item.id}
                    ref={(element) => {
                      giantButtonsRef.current[index] = element;
                    }}
                    className={styles.giantButton}
                    onClick={() => setActiveScreen(item.id)}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {activeScreen === "aomi" && (
            <motion.section
              key="aomi"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <h2>AOMI Action-Observation Player</h2>
              </header>

              <div className={styles.aomiList}>
                {skillVideos.map((video) => (
                  <button
                    key={video.id}
                    className={`${styles.giantButton} ${selectedVideo === video.id ? styles.giantActive : ""}`}
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <strong>{video.title}</strong>
                    <span>{video.cue}</span>
                  </button>
                ))}
              </div>

              <div className={styles.playerFrame}>
                <motion.div
                  className={`${styles.videoMock} ${mirrorMode ? styles.mirrored : ""}`}
                  animate={{ opacity: [0.84, 1, 0.84] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  <p>{activeVideo.title}</p>
                  <small>Playback: {playbackSpeed.toFixed(2)}x {loopSegment ? "• Looping Segment" : ""}</small>
                </motion.div>

                <div className={styles.playerControls}>
                  <button className={styles.giantButton} onClick={() => setPlaybackSpeed((speed) => Math.max(0.5, speed - 0.25))}>
                    <Turtle size={18} />
                    Slow Down
                  </button>
                  <button className={styles.giantButton} onClick={() => setLoopSegment((value) => !value)}>
                    <Repeat size={18} />
                    Loop Segment {loopSegment ? "On" : "Off"}
                  </button>
                  <button className={styles.giantButton} onClick={() => setMirrorMode((value) => !value)}>
                    <FlipHorizontal2 size={18} />
                    Mirror Toggle {mirrorMode ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {activeScreen === "rhythm" && (
            <motion.section
              key="rhythm"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <h2>Haptic Rhythm Pacer</h2>
              </header>

              <div className={styles.rhythmPad}>
                <motion.div
                  key={beatPulse}
                  className={styles.rhythmPulse}
                  animate={rhythmRunning ? { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 0.55 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  {beatWord}
                </motion.div>
                <p>Steady "1-2-1-2" timing for movement planning.</p>
              </div>

              <label htmlFor="bpmRange" className={styles.label}>Pace calibration: {bpm} BPM</label>
              <input
                id="bpmRange"
                className={styles.range}
                type="range"
                min={40}
                max={120}
                step={1}
                value={bpm}
                onChange={(event) => setBpm(Number(event.target.value))}
              />

              <button className={styles.giantButton} onClick={() => setRhythmRunning((value) => !value)}>
                {rhythmRunning ? <Pause size={20} /> : <Play size={20} />}
                {rhythmRunning ? "Pause Rhythm" : "Start Rhythm"}
              </button>
            </motion.section>
          )}

          {activeScreen === "nav" && (
            <motion.section
              key="nav"
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <header className={styles.cardHeader}>
                <h2>Spatial Landmarks Navigation</h2>
              </header>

              <button className={styles.giantButton} onClick={() => setArOverlay((value) => !value)}>
                <ArrowBigUpDash size={20} />
                {arOverlay ? "Hide" : "Show"} Floor Arrow Overlay
              </button>

              <div className={styles.mapScene} role="img" aria-label="Landmark-based route map">
                <div className={styles.routeLine} />
                {landmarks.map((landmark) => (
                  <div key={landmark.id} className={styles.landmarkRow}>
                    <div className={styles.landmarkIcon}><landmark.icon size={20} /></div>
                    <p>{landmark.text}</p>
                  </div>
                ))}

                <AnimatePresence>
                  {arOverlay && (
                    <motion.div
                      className={styles.floorArrow}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <ArrowBigUpDash size={120} />
                      <span>Follow this direction</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
