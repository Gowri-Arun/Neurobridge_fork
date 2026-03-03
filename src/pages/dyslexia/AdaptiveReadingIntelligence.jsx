import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Eye, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createReadingSession, getReadingInsights } from "@/lib/dyslexiaApi";

const defaultParagraph =
  "Photosynthesis is a biochemical process in which plants convert light energy into chemical energy and synthesize organic compounds that support growth.";

export default function AdaptiveReadingIntelligence() {
  const [userId, setUserId] = useState("demo-user");
  const [textId, setTextId] = useState("text-001");
  const [paragraph, setParagraph] = useState(defaultParagraph);
  const [displayParagraph, setDisplayParagraph] = useState(defaultParagraph);
  const [fontFamily, setFontFamily] = useState("OpenDyslexic, Arial, sans-serif");
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [overlay, setOverlay] = useState("bg-amber-50");
  const [rulerEnabled, setRulerEnabled] = useState(false);
  const [rulerY, setRulerY] = useState(0);
  const [wordStart, setWordStart] = useState({});
  const [wordDwellMap, setWordDwellMap] = useState({});
  const [rereadSegments, setRereadSegments] = useState([]);
  const [scrollRegressions, setScrollRegressions] = useState(0);
  const [previousScrollTop, setPreviousScrollTop] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [comfortScore, setComfortScore] = useState(0);
  const [weeklyInsight, setWeeklyInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const readStartRef = useRef(Date.now());

  const words = useMemo(() => displayParagraph.split(/\s+/).filter(Boolean), [displayParagraph]);

  const handleWordHover = (word, index) => {
    const key = `${word}-${index}`;
    setWordStart((prev) => ({ ...prev, [key]: Date.now() }));
  };

  const handleWordLeave = (word, index) => {
    const key = `${word}-${index}`;
    const started = wordStart[key];
    if (!started) return;
    const dwell = (Date.now() - started) / 1000;
    setWordDwellMap((prev) => ({ ...prev, [key]: dwell }));
  };

  const handleRereadSegment = (segment) => {
    setRereadSegments((prev) => [...prev.slice(-8), segment]);
  };

  const handleScroll = (event) => {
    const currentTop = event.currentTarget.scrollTop;
    if (currentTop < previousScrollTop) {
      setScrollRegressions((v) => v + 1);
    }
    setPreviousScrollTop(currentTop);
  };

  const finishSession = async () => {
    setLoading(true);
    try {
      const durationMinutes = (Date.now() - readStartRef.current) / 60000;
      const calculatedWpm = durationMinutes > 0 ? Math.round(words.length / durationMinutes) : 0;
      setWpm(calculatedWpm);

      const dwellEntries = Object.entries(wordDwellMap);
      const hesitationWords = dwellEntries
        .filter(([, dwell]) => dwell > 1.2)
        .map(([wordKey]) => wordKey.split("-")[0])
        .slice(0, 15);
      const avgDwell = dwellEntries.length
        ? dwellEntries.reduce((sum, [, dwell]) => sum + Number(dwell), 0) / dwellEntries.length
        : 0;

      const session = await createReadingSession({
        userId,
        textId,
        paragraph,
        wpm: calculatedWpm,
        wordDwellTime: Number(avgDwell.toFixed(2)),
        hesitationWords,
        rereadSegments,
        scrollRegressions,
        hesitationThreshold: 1.1,
      });

      setComfortScore(session.readingComfortScore || 0);
      setDisplayParagraph(session.simplifiedParagraph || paragraph);

      const insights = await getReadingInsights(userId);
      setWeeklyInsight(insights.weeklyInsight || "");
    } finally {
      setLoading(false);
      readStartRef.current = Date.now();
      setWordDwellMap({});
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link to="/dyslexia" className="inline-flex items-center text-indigo-700 hover:text-indigo-800">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dyslexia Module
        </Link>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-indigo-700" />
            <h1 className="text-2xl font-bold">Adaptive Reading Intelligence Engine</h1>
            <Badge className="bg-indigo-100 text-indigo-700">Real-time simplification</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input className="border rounded px-3 py-2" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
            <input className="border rounded px-3 py-2" value={textId} onChange={(e) => setTextId(e.target.value)} placeholder="Text ID" />
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <label className="text-sm">
              Font Mode
              <select className="w-full border rounded px-3 py-2 mt-1" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                <option value="OpenDyslexic, Arial, sans-serif">Dyslexia-friendly</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
            </label>
            <label className="text-sm">
              Overlay Preset
              <select className="w-full border rounded px-3 py-2 mt-1" value={overlay} onChange={(e) => setOverlay(e.target.value)}>
                <option value="bg-amber-50">Warm Beige</option>
                <option value="bg-cyan-50">Soft Cyan</option>
                <option value="bg-lime-50">Soft Lime</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4 items-center">
            <label className="text-sm">
              Line Spacing: {lineSpacing.toFixed(1)}
              <input
                type="range"
                min="1.2"
                max="2.6"
                step="0.1"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(Number(e.target.value))}
                className="w-full mt-1"
              />
            </label>
            <label className="flex items-center gap-2 mt-5 md:mt-0">
              <input type="checkbox" checked={rulerEnabled} onChange={(e) => setRulerEnabled(e.target.checked)} />
              <span className="text-sm">Enable reading ruler</span>
            </label>
          </div>
        </Card>

        <Card className={`p-6 relative ${overlay}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <SlidersHorizontal className="w-4 h-4" /> Behavioral tracking enabled
            </div>
            <button
              className="text-sm text-indigo-700 underline"
              onClick={() => handleRereadSegment(displayParagraph.slice(0, 70))}
            >
              Mark Re-read Segment
            </button>
          </div>

          <div
            className="max-h-72 overflow-y-auto border rounded bg-white/80 p-4"
            onScroll={handleScroll}
            onMouseMove={(e) => setRulerY(e.nativeEvent.offsetY)}
            style={{ fontFamily, lineHeight: lineSpacing }}
          >
            {rulerEnabled && (
              <div className="pointer-events-none absolute left-8 right-8 h-6 bg-indigo-200/40" style={{ top: rulerY + 130 }} />
            )}
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                onMouseEnter={() => handleWordHover(word, index)}
                onMouseLeave={() => handleWordLeave(word, index)}
                className="mr-1 hover:bg-yellow-100 rounded"
              >
                {word}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={finishSession} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Analyzing..." : "Finish Session + Auto-Adapt"}
            </Button>
            <Badge className="bg-cyan-100 text-cyan-700">WPM: {wpm}</Badge>
            <Badge className="bg-green-100 text-green-700">Comfort Score: {comfortScore}</Badge>
            <Badge className="bg-amber-100 text-amber-700">Regressions: {scrollRegressions}</Badge>
            <Badge className="bg-violet-100 text-violet-700">Rereads: {rereadSegments.length}</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2 text-indigo-700">
            <Eye className="w-4 h-4" /> Weekly Progress Insight
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">
            {weeklyInsight || "Weekly insight will appear after at least one analyzed session."}
          </p>
        </Card>
      </div>
    </div>
  );
}
