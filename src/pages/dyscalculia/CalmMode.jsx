/**
 * Calm Mode
 * 
 * Anxiety-aware system that detects stress and provides supportive guidance.
 * 
 * Triggers:
 * - User exits 2+ times mid-session
 * - 3+ consecutive incorrect responses
 * - Long hesitation time (>8 seconds)
 * 
 * Features:
 * - No timer
 * - Slow transitions
 * - Supportive language
 * - Reduced difficulty
 * - Grounding techniques
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Leaf, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  initializeUserProfile,
  shouldActivateCalmMode,
  recordSessionExit,
  saveUserProfile
} from '@/lib/dyscalculiaAdaptiveEngine';

/**
 * Breathing Exercise Component
 */
const BreathingExercise = ({ onComplete }) => {
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const cycles = [
      { phase: 'Breathe in...', duration: 3000, scale: 1.5 },
      { phase: 'Hold...', duration: 2000, scale: 1.5 },
      { phase: 'Breathe out...', duration: 3000, scale: 0.8 },
      { phase: 'Hold...', duration: 2000, scale: 0.8 },
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % cycles.length;
      setBreathingCycle(currentPhase);
    }, 4000); // Simplified timing

    return () => clearInterval(interval);
  }, [isPlaying]);

  const phases = [
    { phase: 'Breathe in...', duration: 3000, label: 'In' },
    { phase: 'Hold...', duration: 2000, label: 'Hold' },
    { phase: 'Breathe out...', duration: 3000, label: 'Out' },
    { phase: 'Hold...', duration: 2000, label: 'Hold' },
  ];

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 text-center space-y-6">
      <h3 className="text-2xl font-bold text-blue-600">💙 Take a Calming Breath</h3>

      {isPlaying ? (
        <div className="space-y-8">
          {/* Animated Circle */}
          <div className="flex justify-center">
            <div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-center transition-all duration-1000 ease-in-out shadow-lg"
              style={{
                transform: breathingCycle % 2 === 0 ? 'scale(0.8)' : 'scale(1.3)',
              }}
            >
              <div className="text-3xl">
                {phases[breathingCycle]?.label}
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 font-semibold">
            {phases[breathingCycle]?.phase}
          </p>

          <Button
            onClick={() => {
              setIsPlaying(false);
              onComplete();
            }}
            className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
          >
            ✓ I Feel Better
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700">
            Let's take a moment to calm your mind and body. Follow the circle as it grows and shrinks.
          </p>
          <Button
            onClick={() => setIsPlaying(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
          >
            🌬️ Start Breathing Exercise
          </Button>
        </div>
      )}
    </Card>
  );
};

/**
 * Grounding Technique (5-4-3-2-1)
 */
const GroundingExercise = ({ onComplete }) => {
  const [selectedSenses, setSelectedSenses] = useState({
    see: 0,
    hear: 0,
    touch: 0,
    smell: 0,
    taste: 0,
  });

  const instructions = [
    { sense: 'see', number: 5, emoji: '👀', label: 'things you SEE', color: 'blue' },
    { sense: 'hear', number: 4, emoji: '👂', label: 'things you HEAR', color: 'green' },
    { sense: 'touch', number: 3, emoji: '✋', label: 'things you FEEL (touch)', color: 'yellow' },
    { sense: 'smell', number: 2, emoji: '👃', label: 'things you SMELL', color: 'purple' },
    { sense: 'taste', number: 1, emoji: '👅', label: 'things you TASTE', color: 'red' },
  ];

  const handleIncrement = (sense) => {
    const current = selectedSenses[sense];
    const max = instructions.find(i => i.sense === sense).number;
    if (current < max) {
      setSelectedSenses({ ...selectedSenses, [sense]: current + 1 });
    }
  };

  const allComplete = Object.values(selectedSenses).every((count, idx) => 
    count === instructions[idx]?.number
  );

  return (
    <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 space-y-6">
      <h3 className="text-2xl font-bold text-green-600">🌿 Grounding Exercise (5-4-3-2-1)</h3>

      <p className="text-gray-700">
        This exercise brings you back to the present moment. Think about what you experience with each sense.
      </p>

      <div className="space-y-4">
        {instructions.map((item) => (
          <div key={item.sense} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-800">
                {item.emoji} Find {item.number} {item.label}
              </label>
              <span className="text-lg font-bold text-green-600">
                {selectedSenses[item.sense]}/{item.number}
              </span>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: item.number }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleIncrement(item.sense)}
                  className={`w-8 h-8 rounded-full font-bold text-white transition-all ${
                    i < selectedSenses[item.sense]
                      ? `bg-${item.color}-600`
                      : `bg-${item.color}-200 opacity-50`
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={onComplete}
        disabled={!allComplete}
        className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg disabled:opacity-50"
      >
        {allComplete ? '✓ I Feel Grounded' : 'Complete all senses...'}
      </Button>
    </Card>
  );
};

/**
 * Supportive Math Mini-Lesson
 */
const CalmMathLesson = ({ onComplete }) => {
  const lessons = [
    {
      title: 'Numbers Are Just Symbols',
      description: 'Math is just a way to show ideas. There\'s no rush to understand everything at once.',
      icon: '🔢',
    },
    {
      title: 'Mistakes Help You Learn',
      description: 'Every error is information. It shows what to practice next. That\'s how learning works!',
      icon: '💡',
    },
    {
      title: 'Your Speed Doesn\'t Matter',
      description: 'Take all the time you need. Understanding is way more important than speed.',
      icon: '⏱️',
    },
    {
      title: 'You Can Do This',
      description: 'You\'ve already learned so much. Each problem you solve makes you stronger.',
      icon: '💪',
    },
  ];

  const [currentLesson, setCurrentLesson] = useState(0);
  const lesson = lessons[currentLesson];

  return (
    <Card className="p-8 bg-gradient-to-br from-rose-50 to-pink-50 space-y-6">
      <h3 className="text-2xl font-bold text-rose-600">💚 Remember This</h3>

      <div className="text-6xl text-center mb-4">{lesson.icon}</div>

      <div className="bg-white p-6 rounded-lg border-2 border-rose-300">
        <h4 className="text-xl font-bold text-rose-700 mb-3">{lesson.title}</h4>
        <p className="text-gray-700 text-lg leading-relaxed">
          {lesson.description}
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
          disabled={currentLesson === 0}
          className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50"
        >
          ← Previous
        </Button>
        <Button
          onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}
          disabled={currentLesson === lessons.length - 1}
          className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50"
        >
          Next →
        </Button>
      </div>

      {currentLesson === lessons.length - 1 && (
        <Button
          onClick={onComplete}
          className="w-full bg-pink-600 hover:bg-pink-700 py-6 text-lg"
        >
          ✓ Ready to Continue
        </Button>
      )}
    </Card>
  );
};

/**
 * Main Calm Mode Component
 */
export default function CalmMode() {
  const [userProfile, setUserProfile] = useState(null);
  const [currentExercise, setCurrentExercise] = useState('welcome');

  useEffect(() => {
    const profile = initializeUserProfile();
    setUserProfile(profile);
  }, []);

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const isCalmModeTriggered = shouldActivateCalmMode(userProfile);

  const handleExerciseComplete = () => {
    // Move to next exercise or finish
    const exercises = ['breathing', 'grounding', 'lesson'];
    const nextIdx = exercises.indexOf(currentExercise) + 1;
    
    if (nextIdx < exercises.length) {
      setCurrentExercise(exercises[nextIdx]);
    } else {
      // Reset and go back to dashboard
      const updatedProfile = { ...userProfile, anxiety_flag: false };
      saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/dyscalculia" className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-rose-600 mb-2">Calm Mode</h1>
        <p className="text-gray-700">
          Take a moment to reset. No pressure, no timer - just you and some supportive exercises.
        </p>
      </div>

      {/* Alert if triggered */}
      {isCalmModeTriggered && (
        <div className="max-w-4xl mx-auto mb-8">
          <Alert className="bg-rose-100 border-rose-300">
            <Heart className="h-5 w-5 text-rose-600" />
            <AlertDescription className="text-rose-800 ml-3">
              <strong>💚 We're Here For You:</strong> We noticed you might be feeling challenged right now. Let's take a break together and use these calming techniques. You're doing great!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Exercise Navigation */}
        <div className="flex justify-center gap-2 flex-wrap">
          {['breathing', 'grounding', 'lesson'].map((exercise, idx) => (
            <button
              key={exercise}
              onClick={() => setCurrentExercise(exercise)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                currentExercise === exercise
                  ? 'bg-rose-600 text-white shadow-lg scale-105'
                  : 'bg-white text-rose-600 border-2 border-rose-300 hover:bg-rose-50'
              }`}
            >
              {idx + 1}. {exercise === 'breathing' ? '🌬️ Breathe' : exercise === 'grounding' ? '🌿 Ground' : '💡 Learn'}
            </button>
          ))}
        </div>

        {/* Content Based on Current Exercise */}
        {currentExercise === 'breathing' && (
          <BreathingExercise onComplete={handleExerciseComplete} />
        )}

        {currentExercise === 'grounding' && (
          <GroundingExercise onComplete={handleExerciseComplete} />
        )}

        {currentExercise === 'lesson' && (
          <CalmMathLesson onComplete={handleExerciseComplete} />
        )}

        {/* Completion Message */}
        {currentExercise === 'lesson' && (
          <Card className="p-8 bg-white border-2 border-green-400 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">
              You Made It!
            </h3>
            <p className="text-gray-700 mb-6">
              You've taken time to care for yourself. That's the most important math skill: knowing when to rest.
            </p>
            <Link to="/dyscalculia">
              <Button className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
                Return to Dashboard
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Info Section */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/60 backdrop-blur-md">
          <h3 className="font-bold text-rose-700 mb-3">🌬️ Breathing Exercise</h3>
          <p className="text-sm text-gray-700">
            Slow, deep breathing activates your body's relaxation response. Great for managing anxiety.
          </p>
        </Card>

        <Card className="p-6 bg-white/60 backdrop-blur-md">
          <h3 className="font-bold text-green-700 mb-3">🌿 Grounding Technique</h3>
          <p className="text-sm text-gray-700">
            The 5-4-3-2-1 method brings you to the present moment by engaging your senses.
          </p>
        </Card>
      </div>
    </div>
  );
}
