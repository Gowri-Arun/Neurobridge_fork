/**
 * Pronunciation Feedback Component
 * 
 * Displays pronunciation analysis, scores, and personalized recommendations.
 */

import React from 'react';
import { Mic, Volume2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const PronunciationFeedback = ({ analysis, recommendations }) => {
  if (!analysis) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        No pronunciation data available
      </div>
    );
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return 'text-green-600 bg-green-50';
    if (accuracy >= 0.75) return 'text-blue-600 bg-blue-50';
    if (accuracy >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 0.9) return { label: 'Excellent', variant: 'default' };
    if (accuracy >= 0.75) return { label: 'Good', variant: 'secondary' };
    if (accuracy >= 0.6) return { label: 'Fair', variant: 'outline' };
    return { label: 'Needs Work', variant: 'destructive' };
  };

  const { label: accuracyLabel, variant: accuracyVariant } = getAccuracyBadge(
    analysis.accuracy
  );

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Accuracy Score */}
        <Card className={`p-4 ${getAccuracyColor(analysis.accuracy)}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Accuracy
            </h4>
            <Badge variant={accuracyVariant} className="text-xs">
              {accuracyLabel}
            </Badge>
          </div>
          <p className="text-3xl font-bold">
            {(analysis.accuracy * 100).toFixed(0)}%
          </p>
          <div className="mt-3">
            <Progress
              value={analysis.accuracy * 100}
              className="h-2"
            />
          </div>
          <p className="text-xs mt-2">
            {analysis.matchedWords} of ~{Math.round(1 / Math.max(analysis.accuracy, 0.1))} words
          </p>
        </Card>

        {/* Confidence Score */}
        <Card className="p-4 bg-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2 text-purple-900">
              <Volume2 className="w-4 h-4" />
              Confidence
            </h4>
            <Badge
              className={`text-xs ${
                analysis.confidence >= 70
                  ? 'bg-green-600'
                  : analysis.confidence >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
            >
              {analysis.confidence >= 70 ? 'Clear' : analysis.confidence >= 50 ? 'Fair' : 'Low'}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {analysis.confidence.toFixed(0)}%
          </p>
          <p className="text-xs text-purple-600 mt-2">
            Microphone clarity and volume
          </p>
        </Card>

        {/* Speaking Rate */}
        <Card className="p-4 bg-orange-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2 text-orange-900">
              <TrendingUp className="w-4 h-4" />
              Speaking Rate
            </h4>
            <Badge
              className={`text-xs ${
                analysis.speakingRate >= 80 && analysis.speakingRate <= 150
                  ? 'bg-green-600'
                  : 'bg-yellow-600'
              }`}
            >
              {analysis.speakingRate < 80
                ? 'Slow'
                : analysis.speakingRate > 180
                ? 'Fast'
                : 'Good'}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {analysis.speakingRate}
          </p>
          <p className="text-xs text-orange-600 mt-2">
            Words per minute (ideal: 80-150)
          </p>
        </Card>
      </div>

      {/* Issues Breakdown */}
      {analysis.issues.length > 0 && (
        <Card className="p-4 border-l-4 border-orange-500 bg-orange-50">
          <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Detected Issues ({analysis.issues.length})
          </h4>
          <div className="space-y-2">
            {analysis.issues.map((issue, idx) => (
              <div key={idx} className="text-sm p-2 bg-orange-100 rounded">
                <p className="font-medium text-orange-900">
                  {issue.type.replace(/_/g, ' ')}
                </p>
                {issue.word && (
                  <p className="text-orange-800 text-xs">Word: "{issue.word}"</p>
                )}
                {issue.actual && (
                  <p className="text-orange-800 text-xs">
                    Said: "{issue.actual}" (Expected: "{issue.expected}")
                  </p>
                )}
                {issue.rate && (
                  <p className="text-orange-800 text-xs">{issue.rate} WPM</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skipped Words */}
      {analysis.skippedWords.length > 0 && (
        <Card className="p-4 border-l-4 border-red-500 bg-red-50">
          <h4 className="font-semibold text-red-900 mb-3">
            Skipped Words ({analysis.skippedWords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.skippedWords.map((item, idx) => (
              <Badge key={idx} className="bg-red-600 text-white">
                {item.word}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Mispronounced Words */}
      {analysis.mispronounced.length > 0 && (
        <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
          <h4 className="font-semibold text-yellow-900 mb-3">
            Words to Practice ({analysis.mispronounced.length})
          </h4>
          <div className="space-y-2">
            {analysis.mispronounced.map((item, idx) => (
              <div key={idx} className="p-2 bg-yellow-100 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-yellow-900">
                    Expected: <span className="font-bold">"{item.expected}"</span>
                  </span>
                  <Progress
                    value={item.similarity * 100}
                    className="w-20 h-2"
                  />
                </div>
                <p className="text-xs text-yellow-800 mt-1">
                  You said: "{item.actual}" ({(item.similarity * 100).toFixed(0)}% match)
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="p-4 border-l-4 border-green-500 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Personalized Recommendations
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-green-100 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{rec.message}</p>
                  {rec.targetWords && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rec.targetWords.map((word, wIdx) => (
                        <Badge key={wIdx} variant="secondary" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge className="bg-green-600 text-white text-xs whitespace-nowrap">
                  {rec.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Issues */}
      {analysis.issues.length === 0 && analysis.skippedWords.length === 0 && (
        <Card className="p-6 text-center bg-green-50 border-green-200">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h4 className="font-semibold text-green-900 mb-2">Perfect Reading!</h4>
          <p className="text-sm text-green-700">
            Great job! You pronounced every word clearly. Keep practicing to maintain this quality.
          </p>
        </Card>
      )}
    </div>
  );
};

export default PronunciationFeedback;
