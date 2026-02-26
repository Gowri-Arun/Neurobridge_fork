/**
 * Session Insights Component
 * 
 * Displays analytics from the current or completed reading session.
 */

import React from 'react';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SessionInsights = ({ insights }) => {
  if (!insights) {
    return (
      <div className="text-center text-gray-500 text-sm">
        No insights available yet
      </div>
    );
  }

  const {
    averageReadingPace,
    strugglingWords,
    comprehensionIssues,
    ttsDependence
  } = insights;

  // Determine overall performance
  const getPerformanceLevel = () => {
    let level = 'good';
    let color = 'bg-green-100 text-green-800';

    if (averageReadingPace > 8000 || ttsDependence > 3) {
      level = 'needs_support';
      color = 'bg-orange-100 text-orange-800';
    }

    if (comprehensionIssues > 5 || strugglingWords.length > 10) {
      level = 'challenge';
      color = 'bg-red-100 text-red-800';
    }

    return { level, color };
  };

  const { level, color } = getPerformanceLevel();
  const performanceLabel = level === 'good' 
    ? 'Good' 
    : level === 'needs_support' 
      ? 'Needs Support' 
      : 'Challenge Detected';

  return (
    <div className="space-y-4">
      {/* Performance Summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Overall</span>
        <Badge className={color}>{performanceLabel}</Badge>
      </div>

      {/* Reading Pace */}
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Avg Reading Pace</p>
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {(averageReadingPace / 1000).toFixed(1)}s
          <span className="text-sm font-normal text-gray-500"> per sentence</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {averageReadingPace > 8000
            ? '⚠️ Consider using text-to-speech support'
            : '✓ Good reading speed'}
        </p>
      </div>

      {/* Struggling Words */}
      {strugglingWords.length > 0 && (
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Top Struggling Words</p>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex flex-wrap gap-2">
            {strugglingWords.slice(0, 5).map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item.word} ({item.tapCount}x)
              </Badge>
            ))}
          </div>
          {strugglingWords.length > 5 && (
            <p className="text-xs text-gray-600 mt-2">
              +{strugglingWords.length - 5} more
            </p>
          )}
        </div>
      )}

      {/* Comprehension Issues */}
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Comprehension Issues</p>
          <Zap className="w-4 h-4 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {comprehensionIssues}
          <span className="text-sm font-normal text-gray-500"> back-scrolls</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {comprehensionIssues > 5
            ? '💡 Try longer reading sessions with breaks'
            : '✓ Good comprehension flow'}
        </p>
      </div>

      {/* TTS Usage */}
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">TTS Activations</p>
        <p className="text-2xl font-bold text-gray-900">
          {ttsDependence}
          <span className="text-sm font-normal text-gray-500"> times</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {ttsDependence > 3
            ? '⚠️ High audio usage - consider visual strategies'
            : '✓ Balanced audio/visual reading'}
        </p>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Next Steps</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {averageReadingPace > 8000 && (
            <li>• ↑ Try increasing font size if needed</li>
          )}
          {strugglingWords.length > 0 && (
            <li>• 📝 Review highlighted words separately</li>
          )}
          {comprehensionIssues > 5 && (
            <li>• ✏️ Increase line spacing for focus</li>
          )}
          {ttsDependence <= 1 && (
            <li>• 🎧 Use text-to-speech for challenging texts</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SessionInsights;
