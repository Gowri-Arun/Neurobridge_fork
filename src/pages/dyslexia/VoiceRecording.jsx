/**
 * Voice Recording Component
 * 
 * UI for recording user's voice while reading.
 * Shows recording controls, transcript, and real-time feedback.
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useVoiceRecording from '@/hooks/useVoiceRecording';
import { analyzeTranscript, generatePronunciationRecommendations } from '@/lib/pronunciationAnalysis';
import PronunciationFeedback from './PronunciationFeedback';

const VoiceRecording = ({ expectedText, onAnalysisComplete }) => {
  const voice = useVoiceRecording();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Animate volume level while recording
  useEffect(() => {
    if (!voice.isRecording) return;

    const animationInterval = setInterval(() => {
      const volume = voice.getVolume();
      setVolumeLevel(Math.min(volume * 100, 100));
    }, 100);

    return () => clearInterval(animationInterval);
  }, [voice.isRecording]);

  /**
   * Handle start recording
   */
  const handleStartRecording = async () => {
    const success = await voice.startRecording();
    if (success) {
      setShowAnalysis(false);
      setAnalysis(null);
    }
  };

  /**
   * Handle stop recording and analyze
   */
  const handleStopAndAnalyze = async () => {
    const result = await voice.stopRecording();

    if (result && expectedText) {
      // Check if we have a transcript
      if (!result.transcript || result.transcript.trim().length === 0) {
        // No transcript - likely due to network error
        setAnalysis({
          accuracy: 0,
          issues: [{
            type: 'NO_TRANSCRIPT',
            severity: 'high',
            message: 'No transcript available - speech recognition requires internet connection'
          }],
          speakingRate: 0,
          totalWords: 0
        });
        setRecommendations([{
          priority: 'high',
          category: 'Technical',
          suggestion: 'Ensure you have an active internet connection for speech-to-text features',
          reason: 'Speech recognition requires online services'
        }]);
        setShowAnalysis(true);
        return;
      }

      // Analyze pronunciation
      const pronunciationAnalysis = analyzeTranscript(
        expectedText,
        result.transcript,
        result.confidence,
        result.duration
      );

      setAnalysis(pronunciationAnalysis);

      // Generate recommendations
      const recs = generatePronunciationRecommendations(pronunciationAnalysis);
      setRecommendations(recs);

      setShowAnalysis(true);

      // Callback to parent
      if (onAnalysisComplete) {
        onAnalysisComplete(pronunciationAnalysis);
      }
    }
  };

  /**
   * Handle cancel recording
   */
  const handleCancel = () => {
    voice.cancelRecording();
    setShowAnalysis(false);
    setAnalysis(null);
  };

  if (!expectedText) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Load text first to enable voice recording
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                Voice Recording
              </h3>
              <p className="text-sm text-gray-600">
                {voice.isRecording
                  ? 'Recording... Speak clearly and read the text aloud.'
                  : 'Click record to start reading aloud. The system will analyze your pronunciation.'}
              </p>
            </div>
            {voice.isRecording && (
              <Badge className="bg-red-600 animate-pulse">● Recording</Badge>
            )}
          </div>

          {/* Recording Time & Transcript */}
          {voice.isRecording && (
            <div className="space-y-3">
              {/* Timer */}
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 font-mono">
                  {voice.formatTime(voice.recordingTime)}
                </p>
              </div>

              {/* Volume Meter */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Microphone Level</span>
                  <span className="text-gray-600">{Math.round(volumeLevel)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100"
                    style={{ width: `${volumeLevel}%` }}
                  />
                </div>
              </div>

              {/* Live Transcript */}
              {voice.transcript && (
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Live Transcript:</p>
                  <p className="text-sm text-gray-900">{voice.transcript}</p>
                </div>
              )}

              {/* Confidence */}
              {voice.confidence > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Recognition Confidence</span>
                  <Badge
                    className={
                      voice.confidence >= 70
                        ? 'bg-green-600'
                        : voice.confidence >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }
                  >
                    {voice.confidence}%
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Warning Message (non-critical) */}
          {voice.recognitionWarning && voice.isRecording && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600 text-lg">ℹ️</div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-800">{voice.recognitionWarning}</p>
                  <p className="text-xs text-yellow-700 mt-1 font-semibold">
                    ✓ Audio recording is working - you can continue and stop when finished.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message (critical) */}
          {voice.recordingError && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-red-600 text-2xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Recording Error</p>
                  <p className="text-sm text-red-700 mt-1">{voice.recordingError}</p>
                </div>
              </div>
              
              {/* Troubleshooting Tips */}
              <div className="bg-white p-3 rounded border border-red-200">
                <p className="text-xs font-semibold text-gray-900 mb-2">💡 Troubleshooting Tips:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>✓ Check that your microphone is connected and working</li>
                  <li>✓ Allow microphone permissions when the browser asks</li>
                  <li>✓ Refresh the page and try again</li>
                  <li>✓ Try a different browser (Chrome, Edge, or Safari)</li>
                  <li>✓ Make sure you have a stable internet connection</li>
                  <li>✓ Restart your computer if the microphone was recently connected</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!voice.isRecording ? (
              <>
                <Button
                  onClick={handleStartRecording}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
                >
                  <Mic className="w-4 h-4" />
                  {voice.recordingError ? 'Retry Recording' : 'Start Recording'}
                </Button>
                {voice.recordingError && (
                  <Button
                    onClick={() => voice.cancelRecording()}
                    variant="outline"
                    className="gap-2"
                  >
                    Clear Error
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={handleStopAndAnalyze}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Square className="w-4 h-4" />
                  Analyze
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {showAnalysis && analysis && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
            📊 Pronunciation Analysis
          </h3>
          <PronunciationFeedback analysis={analysis} recommendations={recommendations} />
        </div>
      )}
    </div>
  );
};

export default VoiceRecording;
