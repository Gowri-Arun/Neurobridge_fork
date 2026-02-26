/**
 * useAdaptiveReadingEngine Hook
 * 
 * Main hook that orchestrates the entire adaptive reading system.
 * Monitors user behavior, detects struggles, and applies adjustments.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SentenceTracker,
  detectDecodingDifficulty,
  detectWordStruggle,
  detectComprehensionIssue,
  detectAuditoryDependency,
  generateAdaptiveAdjustments,
  analyzeReadingPatterns,
  STRUGGLE_TYPES
} from '@/lib/struggleDetection';
import {
  createSessionMetrics,
  saveMetricsSession,
  recordStruggle,
  recordWordTap,
  recordScrollEvent,
  recordTTSActivation,
  recordAdjustment,
  getAverageMetrics
} from '@/lib/readingMetrics';
import { addWordToBank } from '@/lib/wordBank';

export const useAdaptiveReadingEngine = () => {
  const [textContent, setTextContent] = useState('');
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    fontSize: 100,
    lineSpacing: 1.5,
    letterSpacing: 0,
    highlightWords: [],
    enableDyslexicFont: false,
    slowDownPace: false,
    reduceReadingLoad: false,
    enableAudioSupport: false
  });

  const [detectedStruggles, setDetectedStruggles] = useState([]);
  const [readingStats, setReadingStats] = useState({
    sentencesRead: 0,
    avgReadTime: 0,
    strugglesDetected: 0,
    adjustmentsApplied: 0
  });

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionInsights, setSessionInsights] = useState(null);

  // Refs for tracking without triggering re-renders
  const sessionMetricsRef = useRef(null);
  const sentenceTrackerRef = useRef(new SentenceTracker());
  const lastScrollTimestampRef = useRef(null);
  const processingRef = useRef(false);

  /**
   * Initialize a new reading session
   */
  const startSession = useCallback(() => {
    sessionMetricsRef.current = createSessionMetrics();
    sentenceTrackerRef.current = new SentenceTracker();
    lastScrollTimestampRef.current = null;
    setIsSessionActive(true);
    setDetectedStruggles([]);
    setAdaptiveSettings(prev => ({ ...prev }));
  }, []);

  /**
   * End current session and save metrics
   */
  const endSession = useCallback(() => {
    if (sessionMetricsRef.current) {
      sessionMetricsRef.current.endTime = Date.now();
      sessionMetricsRef.current.totalReadTime = sessionMetricsRef.current.endTime - sessionMetricsRef.current.startTime;
      
      // Analyze final patterns
      const patterns = analyzeReadingPatterns(sessionMetricsRef.current);
      setSessionInsights(patterns);
      
      // Save session
      saveMetricsSession(sessionMetricsRef.current);
      
      setIsSessionActive(false);
    }
  }, []);

  /**
   * Process sentence completion and analyze reading time
   */
  const processSentenceCompletion = useCallback((sentenceIndex, readTime) => {
    if (!sessionMetricsRef.current || processingRef.current) return;
    
    processingRef.current = true;

    const decodingResult = detectDecodingDifficulty(sentenceIndex, readTime);
    
    if (decodingResult.detected) {
      const struggle = {
        type: STRUGGLE_TYPES.DECODING_DIFFICULTY,
        sentenceIndex,
        readTime,
        severity: decodingResult.severity
      };
      
      recordStruggle(sessionMetricsRef.current, struggle.type, {
        sentenceIndex,
        readTime,
        severity: struggle.severity
      });

      setDetectedStruggles(prev => [...prev, struggle]);
      
      // Apply adaptive adjustments
      applyAdaptiveAdjustments([struggle]);
    }

    // Update stats
    sessionMetricsRef.current.readingPace.sentencesRead++;
    sessionMetricsRef.current.readingPace.avgTimePerSentence = 
      sentenceTrackerRef.current.getAverageReadTime();

    setReadingStats(prev => ({
      ...prev,
      sentencesRead: sessionMetricsRef.current.readingPace.sentencesRead,
      avgReadTime: sessionMetricsRef.current.readingPace.avgTimePerSentence
    }));

    processingRef.current = false;
  }, []);

  /**
   * Handle word tap interactions
   */
  const handleWordTap = useCallback((word) => {
    if (!sessionMetricsRef.current) return;

    recordWordTap(sessionMetricsRef.current, word);
    const tapCount = sessionMetricsRef.current.wordTaps[word] || 0;

    const wordStruggle = detectWordStruggle(word, tapCount);
    
    if (wordStruggle.detected) {
      const struggle = {
        type: STRUGGLE_TYPES.WORD_STRUGGLE,
        word,
        tapCount,
        severity: wordStruggle.severity
      };

      recordStruggle(sessionMetricsRef.current, struggle.type, { word, tapCount });
      setDetectedStruggles(prev => [...prev, struggle]);
      
      // Highlight the word
      setAdaptiveSettings(prev => ({
        ...prev,
        highlightWords: [...prev.highlightWords, {
          word,
          severity: struggle.severity
        }]
      }));
      
      // Add word to Word Bank for later review
      addWordToBank(word, {
        sourceContext: 'Detected as struggled word in Reader Mode',
        notes: `Tapped ${tapCount} times - indicating difficulty`
      });
    }
  }, []);

  /**
   * Apply adaptive adjustments based on struggles
   */
  const applyAdaptiveAdjustments = useCallback((struggles) => {
    const allStruggles = [...detectedStruggles, ...struggles];
    const adjustments = generateAdaptiveAdjustments(allStruggles);

    setAdaptiveSettings(adjustments);

    if (sessionMetricsRef.current) {
      recordAdjustment(sessionMetricsRef.current, 'auto_adjustment', {
        struggleCount: allStruggles.length,
        adjustmentsApplied: adjustments
      });
    }

    setReadingStats(prev => ({
      ...prev,
      strugglesDetected: allStruggles.length,
      adjustmentsApplied: (prev.adjustmentsApplied || 0) + 1
    }));
  }, [detectedStruggles]);

  /**
   * Handle scroll events for comprehension detection
   */
  const handleScrollEvent = useCallback((scrollEvent) => {
    if (!sessionMetricsRef.current) return;

    const { direction, timestamp } = scrollEvent;
    recordScrollEvent(sessionMetricsRef.current, direction, timestamp);

    if (direction === 'up' && lastScrollTimestampRef.current) {
      const comprehensionIssue = detectComprehensionIssue(
        { direction, timestamp },
        lastScrollTimestampRef.current
      );

      if (comprehensionIssue.detected) {
        const struggle = {
          type: STRUGGLE_TYPES.COMPREHENSION_ISSUE,
          timeSinceLastEvent: comprehensionIssue.timeSinceLastEvent,
          severity: comprehensionIssue.severity
        };

        recordStruggle(sessionMetricsRef.current, struggle.type, {
          timeSinceLastEvent: struggle.timeSinceLastEvent
        });

        setDetectedStruggles(prev => [...prev, struggle]);
        applyAdaptiveAdjustments([struggle]);
      }
    }

    lastScrollTimestampRef.current = timestamp;
  }, [applyAdaptiveAdjustments]);

  /**
   * Handle TTS activation
   */
  const handleTTSActivation = useCallback(() => {
    if (!sessionMetricsRef.current) return;

    recordTTSActivation(sessionMetricsRef.current);

    const auditoryDep = detectAuditoryDependency(sessionMetricsRef.current.ttsActivations);
    
    if (auditoryDep.detected) {
      const struggle = {
        type: STRUGGLE_TYPES.AUDITORY_DEPENDENCY,
        activationCount: auditoryDep.activationCount,
        severity: 0.5 + (auditoryDep.activationCount / 10) * 0.5
      };

      recordStruggle(sessionMetricsRef.current, struggle.type, {
        activationCount: struggle.activationCount
      });

      setDetectedStruggles(prev => [...prev, struggle]);
      applyAdaptiveAdjustments([struggle]);
    }
  }, [applyAdaptiveAdjustments]);

  /**
   * Manually adjust settings
   */
  const manuallyAdjustSettings = useCallback((newSettings) => {
    setAdaptiveSettings(prev => ({
      ...prev,
      ...newSettings
    }));

    if (sessionMetricsRef.current) {
      recordAdjustment(sessionMetricsRef.current, 'manual_adjustment', newSettings);
    }
  }, []);

  /**
   * Get personalized recommendations based on user's history
   */
  const getPersonalizedRecommendations = useCallback(() => {
    const avgMetrics = getAverageMetrics(10);
    const recommendations = [];

    if (!avgMetrics) {
      return recommendations;
    }

    if (avgMetrics.avgTimePerSentence > 8000) {
      recommendations.push({
        type: 'font_size',
        suggestion: 'Increase font size for easier reading',
        priority: 'high'
      });
    }

    if (avgMetrics.avgTTSActivations > 3) {
      recommendations.push({
        type: 'reading_load',
        suggestion: 'Consider reducing text chunks for better comprehension',
        priority: 'medium'
      });
    }

    if (avgMetrics.totalStruggleEvents > 5) {
      recommendations.push({
        type: 'dyslexic_font',
        suggestion: 'Enable OpenDyslexic font for better letter distinction',
        priority: 'high'
      });
    }

    return recommendations;
  }, []);

  return {
    // State
    textContent,
    adaptiveSettings,
    detectedStruggles,
    readingStats,
    isSessionActive,
    sessionInsights,

    // Content management
    setTextContent,

    // Session management
    startSession,
    endSession,

    // User interaction handlers
    processSentenceCompletion,
    handleWordTap,
    handleScrollEvent,
    handleTTSActivation,

    // Settings
    manuallyAdjustSettings,
    applyAdaptiveAdjustments,

    // Insights
    getPersonalizedRecommendations,

    // Refs for integration
    sentenceTrackerRef,
    sessionMetricsRef
  };
};

export default useAdaptiveReadingEngine;
