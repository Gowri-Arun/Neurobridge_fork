/**
 * Adaptive Text Display Component
 * 
 * Renders text with adaptive formatting and sentence tracking.
 * Handles word interactions and scroll events for struggle detection.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdaptiveTextDisplay = ({
  text,
  settings,
  onWordTap,
  onSentenceComplete,
  onScroll,
  onCurrentSentenceChange,
  currentSentenceIndex,
  fontFamily
}) => {
  const [sentences, setSentences] = useState([]);
  const [highlightedWords, setHighlightedWords] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const lastScrollPositionRef = useRef(0);
  const sentenceRefsRef = useRef({});
  const sentenceTimesRef = useRef({});
  const observerRef = useRef(null);
  const visibleSentencesRef = useRef(new Set());
  const lastScrollTimeRef = useRef(0);

  // Parse text into sentences
  useEffect(() => {
    if (!text) {
      setSentences([]);
      sentenceTimesRef.current = {};
      visibleSentencesRef.current.clear();
      return;
    }

    // Simple sentence splitting (can be enhanced with better NLP)
    const sentenceRegex = /[.!?]+/g;
    const rawSentences = text.split(sentenceRegex).filter(s => s.trim());
    
    sentenceRefsRef.current = {};
    sentenceTimesRef.current = {};
    visibleSentencesRef.current.clear();
    
    setSentences(rawSentences.map((s, idx) => ({
      id: idx,
      text: s.trim(),
      startTime: null,
      endTime: null
    })));
  }, [text]);

  /**
   * Setup IntersectionObserver for sentence completion detection
   */
  useEffect(() => {
    // Create observer for sentence visibility
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sentenceId = parseInt(entry.target.getAttribute('data-sentence-id'), 10);
          const now = Date.now();

          if (entry.isIntersecting) {
            // Sentence came into view
            visibleSentencesRef.current.add(sentenceId);
            
            if (!sentenceTimesRef.current[sentenceId]) {
              sentenceTimesRef.current[sentenceId] = now;
            }
          } else {
            // Sentence left view - mark as completed
            if (visibleSentencesRef.current.has(sentenceId)) {
              const startTime = sentenceTimesRef.current[sentenceId];
              if (startTime) {
                const readTime = now - startTime;
                onSentenceComplete(sentenceId, readTime);
              }
              visibleSentencesRef.current.delete(sentenceId);
            }
          }
        });
      },
      {
        threshold: [0.1, 0.9],
        root: scrollContainerRef.current
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onSentenceComplete]);

  /**
   * Observe sentences as they're added
   */
  useEffect(() => {
    sentences.forEach((sentence) => {
      const element = sentenceRefsRef.current[sentence.id];
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        sentences.forEach((sentence) => {
          const el = sentenceRefsRef.current[sentence.id];
          if (el) observerRef.current.unobserve(el);
        });
      }
    };
  }, [sentences]);

  // Build highlighted words set
  useEffect(() => {
    const newHighlighted = new Set();
    settings.highlightWords?.forEach(item => {
      newHighlighted.add(item.word.toLowerCase());
    });
    setHighlightedWords(newHighlighted);
  }, [settings.highlightWords]);

  /**
   * Handle word tap for struggle detection
   */
  const handleWordTap = (word) => {
    onWordTap(word.toLowerCase());
    
    // Visual feedback
    setHighlightedWords(prev => {
      const newSet = new Set(prev);
      newSet.add(word.toLowerCase());
      return newSet;
    });
  };

  /**
   * Handle scroll for comprehension detection
   */
  const handleScroll = useCallback((e) => {
    const now = Date.now();
    const container = e.target ? e.target : scrollContainerRef.current;
    const currentPos = container?.scrollTop || 0;
    const direction = currentPos > lastScrollPositionRef.current ? 'down' : 'up';
    
    // Only trigger if enough time has passed (avoid duplicate events)
    if (now - lastScrollTimeRef.current > 100) {
      onScroll({ direction, timestamp: now });
      lastScrollTimeRef.current = now;
    }
    
    lastScrollPositionRef.current = currentPos;
  }, [onScroll]);

  /**
   * Update current sentence index when hovering (visual feedback)
   */
  const handleSentenceHover = useCallback((sentenceId) => {
    if (onCurrentSentenceChange) {
      onCurrentSentenceChange(sentenceId);
    }
  }, [onCurrentSentenceChange]);

  /**
   * Split text into words and apply styling
   */
  const renderSentenceWithWords = (sentence) => {
    const words = sentence.split(/(\s+)/);
    
    return words.map((word, idx) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      const isHighlighted = highlightedWords.has(cleanWord);
      
      if (/\s+/.test(word)) {
        return <span key={idx}>{word}</span>;
      }

      return (
        <span
          key={idx}
          onClick={() => handleWordTap(word)}
          className={`
            cursor-pointer transition-all duration-200
            ${isHighlighted ? 'bg-yellow-300 font-semibold px-1 rounded' : 'hover:bg-blue-100'}
          `}
          title="Click to mark for analysis"
        >
          {word}
        </span>
      );
    });
  };

  return (
    <ScrollArea
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="w-full h-[600px] rounded-lg border-2 border-blue-200 bg-white p-8"
    >
      <div
        style={{
          fontSize: `${settings.fontSize}%`,
          lineHeight: settings.lineSpacing,
          letterSpacing: `${settings.letterSpacing}px`,
          fontFamily: fontFamily,
          maxWidth: '900px',
          margin: '0 auto'
        }}
        className="text-gray-800 leading-relaxed"
      >
        {sentences.map((sentence, idx) => (
          <div
            key={sentence.id}
            data-sentence-id={sentence.id}
            ref={(el) => {
              if (el) sentenceRefsRef.current[sentence.id] = el;
            }}
            onMouseEnter={() => handleSentenceHover(idx)}
            className={`mb-6 p-3 rounded-lg transition-all duration-200 ${
              currentSentenceIndex === idx
                ? 'bg-blue-200 border-l-4 border-blue-600 shadow-md'
                : 'hover:bg-blue-50'
            }`}
          >
            {renderSentenceWithWords(sentence.text)}
            <span className="opacity-50">.</span>
          </div>
        ))}

        {sentences.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No text to display. Paste or upload text to get started.
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default AdaptiveTextDisplay;
