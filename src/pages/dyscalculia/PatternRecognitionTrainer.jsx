/**
 * Pattern Recognition Trainer
 * 
 * Build pattern detection skills through visual and numerical exercises
 * - Missing number in sequence
 * - Visual block growth patterns
 * - Shape-number matching
 * - Skip counting
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  recordResponse,
  saveUserProfile,
  initializeUserProfile,
  getAdaptiveRecommendations
} from '@/lib/dyscalculiaAdaptiveEngine';

/**
 * Missing Number Exercise
 */
const MissingNumberExercise = ({ userProfile, setUserProfile }) => {
  const sequences = [
    { numbers: [1, 2, 3, 4, null, 6, 7, 8], difficulty: 'beginner' },
    { numbers: [2, 4, 6, 8, null, 12, 14], difficulty: 'beginner' },
    { numbers: [5, 10, 15, 20, null, 30], difficulty: 'intermediate' },
    { numbers: [1, 1, 2, 3, 5, 8, null, 21], difficulty: 'advanced', label: 'Fibonacci' },
    { numbers: [3, 6, 9, 12, null, 18, 21], difficulty: 'intermediate' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);

  const sequence = sequences[currentIdx];
  const missingIdx = sequence.numbers.findIndex(n => n === null);
  const correctAnswer = sequence.difficulty === 'advanced' ? 13 : 
    sequence.numbers[missingIdx - 1] + (sequence.numbers[missingIdx + 1] - sequence.numbers[missingIdx - 1]) / 2;

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === correctAnswer;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      2000,
      `Missing number: pattern with answer ${correctAnswer}`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrect(correct + 1);
      setFeedback('✅ Perfect! You found the pattern!');
      setTimeout(() => {
        setUserAnswer('');
        setFeedback('');
        setCurrentIdx((currentIdx + 1) % sequences.length);
      }, 1500);
    } else {
      setFeedback(`❌ The answer is ${correctAnswer}. Look at the pattern again!`);
    }
  };

  return (
    <Card className="p-6 bg-white space-y-6">
      <h3 className="text-2xl font-bold text-blue-600">🔍 Missing Number</h3>

      {/* Sequence Display */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
        <p className="text-sm text-gray-700 mb-4">Find the missing number:</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {sequence.numbers.map((num, idx) => (
            <React.Fragment key={idx}>
              {num === null ? (
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-2xl font-bold text-yellow-900 border-2 border-yellow-500">
                  ?
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                  {num}
                </div>
              )}
              {idx < sequence.numbers.length - 1 && <div className="flex items-center">→</div>}
            </React.Fragment>
          ))}
        </div>

        {/* Pattern Hint */}
        <div className="mt-4 bg-white p-3 rounded text-center text-sm text-gray-700">
          <p>What's the pattern? (+1? +2? ×2?)</p>
        </div>
      </div>

      {/* Answer Input */}
      <div className="flex gap-3">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter the missing number..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={!userAnswer}
        >
          Check
        </Button>
      </div>

      {feedback && (
        <div className={`text-center text-lg font-bold p-3 rounded-lg ${
          feedback.includes('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {feedback}
        </div>
      )}

      <div className="text-sm text-gray-600">
        ✓ Correct: <strong>{correct}/{sequences.length}</strong>
      </div>
    </Card>
  );
};

/**
 * Block Growth Pattern Exercise
 */
const BlockGrowthExercise = ({ userProfile, setUserProfile }) => {
  const patterns = [
    { stage: 1, blocks: 1 },
    { stage: 2, blocks: 3 },
    { stage: 3, blocks: 6 },
    { stage: 4, blocks: 10 },
    { stage: 5, blocks: null },
  ];

  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);

  const correctAnswer = 15; // Next triangular number

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === correctAnswer;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      2000,
      `Block growth pattern: ${correctAnswer}`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrect(correct + 1);
      setFeedback('✅ Great pattern recognition!');
      setTimeout(() => {
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    } else {
      setFeedback(`❌ The pattern shows ${correctAnswer} blocks at stage 5`);
    }
  };

  return (
    <Card className="p-6 bg-white space-y-6">
      <h3 className="text-2xl font-bold text-green-600">🧩 Block Growth Pattern</h3>

      <p className="text-gray-700">Watch how the blocks grow. What comes next?</p>

      {/* Visual Pattern */}
      <div className="space-y-4 bg-green-50 p-6 rounded-lg border-2 border-green-300">
        {patterns.map((pattern) => (
          <div key={pattern.stage} className="flex items-center gap-4">
            <div className="w-16 font-bold text-lg">Stage {pattern.stage}</div>
            <div className="flex gap-1 flex-wrap">
              {pattern.blocks ? (
                Array.from({ length: pattern.blocks }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-green-500 rounded border-2 border-green-700 hover:scale-110 transition-transform"
                  />
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-green-600">?</div>
                  <span className="text-gray-700">(How many?)</span>
                </div>
              )}
            </div>
            {pattern.blocks && (
              <div className="text-lg font-bold text-green-700 ml-auto">
                {pattern.blocks}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500 text-sm text-blue-900">
        💡 <strong>Hint:</strong> Look at the differences between stages. Do they grow by the same amount each time?
      </div>

      {/* Answer Input */}
      <div className="flex gap-3">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="How many blocks at stage 5?"
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={!userAnswer}
        >
          Check
        </Button>
      </div>

      {feedback && (
        <div className={`text-center text-lg font-bold p-3 rounded-lg ${
          feedback.includes('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {feedback}
        </div>
      )}

      <div className="text-sm text-gray-600">
        ✓ Problems solved: <strong>{correct}</strong>
      </div>
    </Card>
  );
};

/**
 * Shape-Number Matching
 */
const ShapeNumberMatching = ({ userProfile, setUserProfile }) => {
  const shapes = [
    { id: 'triangle', sides: 3, name: 'Triangle' },
    { id: 'square', sides: 4, name: 'Square' },
    { id: 'pentagon', sides: 5, name: 'Pentagon' },
    { id: 'hexagon', sides: 6, name: 'Hexagon' },
  ];

  const generateProblem = () => {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return randomShape;
  };

  const [currentShape, setCurrentShape] = useState(generateProblem());
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === currentShape.sides;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      1500,
      `Shape-number: ${currentShape.name} has ${currentShape.sides} sides`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrect(correct + 1);
      setFeedback('✅ Correct!');
      setTimeout(() => {
        setUserAnswer('');
        setFeedback('');
        setCurrentShape(generateProblem());
      }, 1000);
    } else {
      setFeedback(`❌ A ${currentShape.name} has ${currentShape.sides} sides`);
    }
  };

  const renderShape = (shape) => {
    switch (shape.id) {
      case 'triangle':
        return (
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            <polygon points="50,10 90,90 10,90" fill="currentColor" />
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            <rect x="20" y="20" width="60" height="60" fill="currentColor" />
          </svg>
        );
      case 'pentagon':
        return (
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            <polygon points="50,10 90,39 73,90 27,90 10,39" fill="currentColor" />
          </svg>
        );
      case 'hexagon':
        return (
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            <polygon points="50,5 93,29 93,77 50,100 7,77 7,29" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-white space-y-6">
      <h3 className="text-2xl font-bold text-purple-600">🎨 Shape-Number Matching</h3>

      <p className="text-gray-700">How many sides does this shape have?</p>

      {/* Shape Display */}
      <div className="flex justify-center">
        <div className="text-purple-600">
          {renderShape(currentShape)}
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300 text-center">
        <p className="text-lg font-bold text-purple-900">
          {currentShape.name}
        </p>
        <p className="text-sm text-purple-700 mt-2">
          Count the straight edges
        </p>
      </div>

      {/* Answer Input */}
      <div className="flex gap-3">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Number of sides..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          min="1"
          max="8"
        />
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={!userAnswer}
        >
          Check
        </Button>
      </div>

      {feedback && (
        <div className={`text-center text-lg font-bold p-3 rounded-lg ${
          feedback.includes('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {feedback}
        </div>
      )}

      <div className="text-sm text-gray-600">
        ✓ Correct: <strong>{correct}</strong>
      </div>
    </Card>
  );
};

/**
 * Skip Counting
 */
const SkipCounting = ({ userProfile, setUserProfile }) => {
  const sequences = [
    { step: 2, start: 0, title: 'Count by 2s', colors: 'blue' },
    { step: 5, start: 0, title: 'Count by 5s', colors: 'green' },
    { step: 10, start: 0, title: 'Count by 10s', colors: 'purple' },
    { step: 3, start: 0, title: 'Count by 3s', colors: 'orange' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);

  const sequence = sequences[currentIdx];
  const pattern = Array.from({ length: 6 }, (_, i) => sequence.start + i * sequence.step);
  const nextNumber = pattern[pattern.length - 1] + sequence.step;

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === nextNumber;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      2000,
      `Skip counting by ${sequence.step}: ${nextNumber}`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrect(correct + 1);
      setFeedback('✅ Perfect skip counting!');
      setTimeout(() => {
        setUserAnswer('');
        setFeedback('');
        setCurrentIdx((currentIdx + 1) % sequences.length);
      }, 1500);
    } else {
      setFeedback(`❌ The next number is ${nextNumber}`);
    }
  };

  return (
    <Card className="p-6 bg-white space-y-6">
      <h3 className="text-2xl font-bold text-orange-600">🔢 Skip Counting</h3>

      <p className="text-gray-700">{sequence.title}</p>

      {/* Sequence Display */}
      <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-300">
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {pattern.map((num, idx) => (
            <React.Fragment key={idx}>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-lg font-bold text-white">
                {num}
              </div>
              {idx < pattern.length - 1 && <div className="flex items-center text-2xl text-orange-600">→</div>}
            </React.Fragment>
          ))}
          <div className="flex items-center">→</div>
          <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-lg font-bold text-yellow-900 border-2 border-yellow-500">
            ?
          </div>
        </div>

        <p className="text-center text-sm text-gray-700">
          Each number increases by <strong>{sequence.step}</strong>
        </p>
      </div>

      {/* Answer Input */}
      <div className="flex gap-3">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="What's the next number?"
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
        />
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={!userAnswer}
        >
          Check
        </Button>
      </div>

      {feedback && (
        <div className={`text-center text-lg font-bold p-3 rounded-lg ${
          feedback.includes('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {feedback}
        </div>
      )}

      <div className="text-sm text-gray-600">
        ✓ Correct: <strong>{correct}/{sequences.length}</strong>
      </div>
    </Card>
  );
};

/**
 * Main Component
 */
export default function PatternRecognitionTrainer() {
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('missing');

  useEffect(() => {
    const profile = initializeUserProfile();
    setUserProfile(profile);
  }, []);

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/dyscalculia" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-purple-600 mb-2">Pattern Recognition Trainer</h1>
        <p className="text-gray-700">
          Build pattern detection skills with visual and numerical exercises
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-gray-300 p-1">
            <TabsTrigger value="missing">🔍 Missing</TabsTrigger>
            <TabsTrigger value="growth">🧩 Growth</TabsTrigger>
            <TabsTrigger value="shape">🎨 Shapes</TabsTrigger>
            <TabsTrigger value="skip">🔢 Skip</TabsTrigger>
          </TabsList>

          <TabsContent value="missing" className="space-y-6">
            <MissingNumberExercise userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <BlockGrowthExercise userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>

          <TabsContent value="shape" className="space-y-6">
            <ShapeNumberMatching userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>

          <TabsContent value="skip" className="space-y-6">
            <SkipCounting userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Info */}
      <div className="max-w-4xl mx-auto mt-8 bg-white/60 backdrop-blur-md border-2 border-purple-200 rounded-lg p-6">
        <h3 className="font-bold text-purple-900 mb-3">💡 Why Pattern Recognition?</h3>
        <ul className="space-y-2 text-purple-800 text-sm">
          <li>✓ Patterns are everywhere in math</li>
          <li>✓ Helps predict what comes next</li>
          <li>✓ Builds mathematical intuition</li>
          <li>✓ Makes numbers more meaningful</li>
        </ul>
      </div>
    </div>
  );
}
