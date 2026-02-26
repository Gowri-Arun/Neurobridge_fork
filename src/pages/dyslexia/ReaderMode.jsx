/**
 * Reader Mode Component
 * 
 * Main component for dyslexia-friendly reading with integrated adaptive engine.
 * Supports text input, file upload, and real-time adaptive adjustments.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Copy, Mic, Zap, Settings, BookOpen, AlertCircle } from 'lucide-react';
import useAdaptiveReadingEngine from '@/hooks/useAdaptiveReadingEngine';
import { recordPronunciationAnalysis } from '@/lib/readingMetrics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AdaptiveTextDisplay from './AdaptiveTextDisplay';
import ReaderSettings from './ReaderSettings';
import SessionInsights from './SessionInsights';
import VoiceRecording from './VoiceRecording';
import { toast } from 'sonner';
import './ReaderMode.css';

export default function ReaderMode() {
  const navigate = useNavigate();
  const engine = useAdaptiveReadingEngine();
  
  const [inputMode, setInputMode] = useState('paste'); // 'paste' or 'upload'
  const [showSettings, setShowSettings] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showVoiceRecording, setShowVoiceRecording] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [lastStruggleCount, setLastStruggleCount] = useState(0);
  
  const fileInputRef = useRef(null);
  const utteranceRef = useRef(null);

  // Start session when component mounts
  useEffect(() => {
    engine.startSession();
    return () => {
      if (engine.isSessionActive) {
        engine.endSession();
      }
    };
  }, []);

  // Show notification when new struggles are detected
  useEffect(() => {
    if (engine.detectedStruggles.length > lastStruggleCount) {
      const newStruggles = engine.detectedStruggles.slice(lastStruggleCount);
      newStruggles.forEach(struggle => {
        const type = struggle.type.replace(/_/g, ' ').toUpperCase();
        const severity = Math.round(struggle.severity * 100);
        
        toast.warning(`⚠️ ${type} detected (${severity}% severity)`, {
          description: 'Adaptive settings have been adjusted for better readability',
          duration: 3000
        });
      });
      setLastStruggleCount(engine.detectedStruggles.length);
    }
  }, [engine.detectedStruggles, lastStruggleCount]);

  // Reset reading position when text changes
  useEffect(() => {
    setCurrentSentenceIndex(0);
  }, [engine.textContent]);

  /**
   * Update TTS rate when adaptive settings change
   */
  useEffect(() => {
    if (isTTSActive && utteranceRef.current) {
      const newRate = engine.adaptiveSettings.slowDownPace ? 0.8 : 1.0;
      utteranceRef.current.rate = newRate;
    }
  }, [engine.adaptiveSettings.slowDownPace, isTTSActive]);

  /**
   * Handle text paste input
   */
  const handleTextPaste = (e) => {
    const text = e.target.value;
    engine.setTextContent(text);
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        engine.setTextContent(text);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Trigger file input
   */
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle TTS activation from current position
   */
  const toggleTTS = () => {
    if (!isTTSActive && window.speechSynthesis) {
      engine.handleTTSActivation();
      
      // Get text from current sentence onwards
      const sentenceRegex = /[.!?]+/g;
      const sentences = engine.textContent.split(sentenceRegex).filter(s => s.trim());
      const textFromCurrent = sentences.slice(currentSentenceIndex).join('. ');
      
      if (!textFromCurrent.trim()) {
        return; // No text to read from this point
      }
      
      // Use Web Speech API starting from current position
      utteranceRef.current = new SpeechSynthesisUtterance(textFromCurrent);
      
      // Set initial rate based on current settings
      const rate = engine.adaptiveSettings.slowDownPace ? 0.8 : 1.0;
      utteranceRef.current.rate = rate;
      utteranceRef.current.pitch = 1;
      utteranceRef.current.volume = 1;
      
      window.speechSynthesis.speak(utteranceRef.current);
      setIsTTSActive(true);
      
      utteranceRef.current.onend = () => {
        setIsTTSActive(false);
      };
      
      utteranceRef.current.onerror = () => {
        setIsTTSActive(false);
      };
    } else if (isTTSActive) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsTTSActive(false);
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(engine.textContent);
  };

  /**
   * Handle pronunciation analysis completion
   */
  const handlePronunciationAnalysis = (analysis) => {
    if (engine.sessionMetricsRef.current) {
      recordPronunciationAnalysis(engine.sessionMetricsRef.current, analysis);
    }
  };

  /**
   * Get font family based on settings
   */
  const getFontFamily = () => {
    if (engine.adaptiveSettings.enableDyslexicFont) {
      return "'OpenDyslexic', 'OpenDyslexicMono', monospace";
    }
    return "system-ui, -apple-system, sans-serif";
  };

  const recommendations = engine.getPersonalizedRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dyslexia" className="p-2 hover:bg-blue-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-blue-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Reader Mode
              </h1>
              <p className="text-sm text-blue-600">Dyslexia-friendly adaptive reading engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            {engine.textContent && currentSentenceIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSentenceIndex(0)}
                className="gap-2 text-xs"
              >
                ⏮️ Start Over
              </Button>
            )}
            <Button
              variant={isTTSActive ? 'default' : 'outline'}
              size="sm"
              onClick={toggleTTS}
              className="gap-2"
              disabled={!engine.textContent}
            >
              <Mic className="w-4 h-4" />
              {isTTSActive ? 'Reading...' : 'Read Aloud'}
            </Button>
            <Button
              variant={showVoiceRecording ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowVoiceRecording(!showVoiceRecording)}
              className="gap-2"
              disabled={!engine.textContent}
            >
              🎙️
              Record Voice
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {engine.isSessionActive && (
          <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 grid grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Current Position</p>
              <p className="text-lg font-bold text-blue-900">
                {engine.textContent ? currentSentenceIndex + 1 : 0}
              </p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Sentences Read</p>
              <p className="text-lg font-bold text-blue-900">{engine.readingStats.sentencesRead}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Avg Read Time</p>
              <p className="text-lg font-bold text-blue-900">
                {(engine.readingStats.avgReadTime / 1000).toFixed(1)}s
              </p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Struggles Detected</p>
              <p className="text-lg font-bold text-orange-600">
                {engine.readingStats.strugglesDetected}
              </p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Adjustments Applied</p>
              <p className="text-lg font-bold text-green-600">
                {engine.readingStats.adjustmentsApplied}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="col-span-2">
            {!engine.textContent ? (
              /* Input Section */
              <div className="space-y-6">
                <Card className="p-8 border-2 border-blue-200 bg-blue-50/50">
                  <Tabs value={inputMode} onValueChange={setInputMode} defaultValue="paste">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="paste">Paste Text</TabsTrigger>
                      <TabsTrigger value="upload">Upload File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="paste" className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Paste your text below
                        </label>
                        <Textarea
                          placeholder="Paste text or start typing..."
                          value={engine.textContent}
                          onChange={handleTextPaste}
                          className="min-h-96 text-base leading-relaxed border-2 border-blue-200 focus:border-blue-500"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.pdf,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={triggerFileUpload}
                          className="w-full py-12 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition cursor-pointer flex flex-col items-center gap-3"
                        >
                          <Upload className="w-8 h-8 text-blue-600" />
                          <div className="text-center">
                            <p className="font-semibold text-blue-900">Click to upload file</p>
                            <p className="text-sm text-blue-600">Support: TXT, PDF, DOCX</p>
                          </div>
                        </button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <Card className="p-6 border-l-4 border-green-500 bg-green-50">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Personalized Recommendations
                    </h3>
                    <div className="space-y-2">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Badge className="mt-1 bg-green-600">{rec.priority}</Badge>
                          <p className="text-sm text-green-900">{rec.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              /* Reading Display Section */
              <div className="space-y-4">
                <Card className="p-0 border-2 border-blue-200 bg-white">
                  <AdaptiveTextDisplay
                    text={engine.textContent}
                    settings={engine.adaptiveSettings}
                    onWordTap={engine.handleWordTap}
                    onSentenceComplete={engine.processSentenceCompletion}
                    onScroll={engine.handleScrollEvent}
                    onCurrentSentenceChange={setCurrentSentenceIndex}
                    currentSentenceIndex={currentSentenceIndex}
                    fontFamily={getFontFamily()}
                  />
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="gap-2 w-full"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => engine.setTextContent('')}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Clear & Start New
                  </Button>
                </div>

                {/* Voice Recording Section */}
                {showVoiceRecording && (
                  <div className="mt-6">
                    <VoiceRecording
                      expectedText={engine.textContent}
                      onAnalysisComplete={handlePronunciationAnalysis}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Struggles */}
            {engine.detectedStruggles.length > 0 && (
              <Card className="p-4 border-orange-200 bg-orange-50">
                <h3 className="font-semibold text-orange-900 mb-3">Detected Struggles</h3>
                <div className="space-y-2">
                  {engine.detectedStruggles.slice(-5).map((struggle, idx) => (
                    <div key={idx} className="text-xs p-2 bg-orange-100 rounded">
                      <p className="font-medium text-orange-900">
                        {struggle.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-orange-700">
                        Severity: {(struggle.severity * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Current Settings Preview */}
            {engine.textContent && (
              <Card className="p-4 border-blue-200 bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-4">Current Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-blue-900">Font Size</label>
                      <span className="text-sm text-blue-600">{engine.adaptiveSettings.fontSize}%</span>
                    </div>
                    <Slider
                      value={[engine.adaptiveSettings.fontSize]}
                      onValueChange={(val) =>
                        engine.manuallyAdjustSettings({ fontSize: val[0] })
                      }
                      min={75}
                      max={150}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-blue-900">Line Spacing</label>
                      <span className="text-sm text-blue-600">{engine.adaptiveSettings.lineSpacing.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[engine.adaptiveSettings.lineSpacing * 10]}
                      onValueChange={(val) =>
                        engine.manuallyAdjustSettings({ lineSpacing: val[0] / 10 })
                      }
                      min={10}
                      max={30}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <label className="text-sm font-medium text-blue-900">OpenDyslexic Font</label>
                    <Switch
                      checked={engine.adaptiveSettings.enableDyslexicFont}
                      onCheckedChange={(checked) =>
                        engine.manuallyAdjustSettings({ enableDyslexicFont: checked })
                      }
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Session Insights */}
            {engine.sessionInsights && (
              <Card className="p-4 border-green-200 bg-green-50">
                <h3 className="font-semibold text-green-900 mb-3">Session Insights</h3>
                <SessionInsights insights={engine.sessionInsights} />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ReaderSettings
          settings={engine.adaptiveSettings}
          onSettingsChange={engine.manuallyAdjustSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
