/**
 * Real-Life Math Simulator
 * 
 * Build practical numerical confidence with real-world scenarios:
 * - Grocery total calculator
 * - Change calculator
 * - Time reading
 * - Simple budgeting
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Coins, Clock, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  recordResponse,
  saveUserProfile,
  initializeUserProfile,
  getAdaptiveRecommendations
} from '@/lib/dyscalculiaAdaptiveEngine';

/**
 * Grocery Total Calculator
 */
const GroceryCalculator = ({ userProfile, setUserProfile }) => {
  const items = [
    { name: 'Milk', price: 28 },
    { name: 'Bread', price: 15 },
    { name: 'Eggs', price: 42 },
    { name: 'Cheese', price: 65 },
    { name: 'Apples', price: 35 },
    { name: 'Juice', price: 48 },
  ];

  const [selectedItems, setSelectedItems] = useState([]);
  const [userTotal, setUserTotal] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);
  const [showDetailBrake, setShowDetailBreak] = useState(false);

  const correctTotal = selectedItems.reduce((sum, idx) => sum + items[idx].price, 0);

  const handleAddItem = (idx) => {
    if (!selectedItems.includes(idx)) {
      setSelectedItems([...selectedItems, idx]);
    }
  };

  const handleRemoveItem = (idx) => {
    setSelectedItems(selectedItems.filter(i => i !== idx));
  };

  const handleSubmit = () => {
    if (!userTotal) return;

    const isCorrect = parseInt(userTotal) === correctTotal;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      2000,
      `Grocery total: ${correctTotal}`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrect(correct + 1);
      setFeedback('✅ Perfect! Great shopping math!');
      setTimeout(() => {
        setSelectedItems([]);
        setUserTotal('');
        setFeedback('');
        setShowDetailBreak(false);
      }, 1500);
    } else {
      setFeedback(`❌ Not quite. The total is ₹${correctTotal}`);
      setShowDetailBreak(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white">
        <h3 className="text-2xl font-bold text-blue-600 mb-4">🛒 Shopping Scenario</h3>
        <p className="text-gray-600 mb-6">
          Select items and calculate the total cost. What will you buy today?
        </p>

        {/* Item Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAddItem(idx)}
              disabled={selectedItems.includes(idx)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedItems.includes(idx)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-300 hover:border-blue-500'
              }`}
            >
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm">₹{item.price}</div>
            </button>
          ))}
        </div>

        {/* Shopping Basket */}
        {selectedItems.length > 0 && (
          <Card className="p-4 bg-blue-50 border-2 border-blue-200 mb-6">
            <h4 className="font-bold text-blue-900 mb-3">Your Basket:</h4>
            <div className="space-y-2 mb-4">
              {selectedItems.map((idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="font-semibold">{items[idx].name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">₹{items[idx].price}</span>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            {selectedItems.length > 0 && (
              <div className="bg-white p-3 rounded border-2 border-blue-300">
                <p className="text-sm text-gray-700 mb-2">Calculation:</p>
                <p className="text-lg font-bold text-blue-600">
                  {selectedItems.map(idx => items[idx].price).join(' + ')} = ?
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Detailed breakdown if wrong */}
        {showDetailBrake && selectedItems.length > 0 && (
          <Alert className="bg-amber-50 border-amber-300 mb-6">
            <AlertDescription className="text-amber-800">
              Let me show you step by step:
              <div className="mt-3 space-y-1">
                {selectedItems.map((idx, i) => (
                  <div key={idx} className="text-sm">
                    Step {i + 1}: {items[idx].name} = ₹{items[idx].price}
                  </div>
                ))}
                <div className="font-bold text-amber-900 mt-2">
                  Total: ₹{correctTotal}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Answer Input */}
        <div className="flex gap-3 mb-4">
          <input
            type="number"
            value={userTotal}
            onChange={(e) => setUserTotal(e.target.value)}
            placeholder="Enter total..."
            disabled={selectedItems.length === 0}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={selectedItems.length === 0 || !userTotal}
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

        <div className="mt-4 text-sm text-gray-600">
          ✓ Scenarios completed: <strong>{correct}</strong>
        </div>
      </Card>
    </div>
  );
};

/**
 * Change Calculator
 */
const ChangeCalculator = ({ userProfile, setUserProfile }) => {
  const scenarios = [
    { cost: 47, paid: 100, name: 'Small snack' },
    { cost: 135, paid: 200, name: 'Lunch' },
    { cost: 67, paid: 100, name: 'Groceries' },
    { cost: 234, paid: 500, name: 'Books' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userChange, setUserChange] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);
  const [correct_answers, setCorrectAnswers] = useState(0);

  const current = scenarios[currentIdx];
  const correctChange = current.paid - current.cost;

  const handleSubmit = () => {
    if (!userChange) return;

    const isCorrect = parseInt(userChange) === correctChange;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      2000,
      `Change: ₹${current.paid} - ₹${current.cost}`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrectAnswers(correct_answers + 1);
      setFeedback('✅ Correct change!');
      setTimeout(() => {
        setUserChange('');
        setFeedback('');
        setCurrentIdx((currentIdx + 1) % scenarios.length);
      }, 1500);
    } else {
      setFeedback(`❌ Change should be ₹${correctChange}`);
    }
  };

  return (
    <Card className="p-6 bg-white space-y-6">
      <h3 className="text-2xl font-bold text-green-600">🪙 Change Calculator</h3>

      <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
        <p className="text-gray-700 mb-4">
          <strong>Scenario: {current.name}</strong>
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <span className="font-semibold">Item cost:</span>
            <span className="text-2xl font-bold text-gray-800">₹{current.cost}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded">
            <span className="font-semibold">You paid:</span>
            <span className="text-2xl font-bold text-blue-600">₹{current.paid}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded border-2 border-green-400">
            <span className="font-semibold">How much change?</span>
            <span className="text-lg text-gray-600">₹?</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 bg-white p-3 rounded">
          Calculate: ₹{current.paid} - ₹{current.cost} = ?
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          value={userChange}
          onChange={(e) => setUserChange(e.target.value)}
          placeholder="Enter change amount..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={!userChange}
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
        ✓ Correct: <strong>{correct_answers}/{scenarios.length}</strong>
      </div>
    </Card>
  );
};

/**
 * Time Reading
 */
const TimeReading = ({ userProfile, setUserProfile }) => {
  const timeScenarios = [
    { hour: 3, minute: 15, text: 'Afternoon snack time' },
    { hour: 9, minute: 30, text: 'Mid-morning' },
    { hour: 6, minute: 45, text: 'Dinner time' },
    { hour: 11, minute: 50, text: 'Almost noon' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct_answers, setCorrectAnswers] = useState(0);

  const current = timeScenarios[currentIdx];
  const correctTime = `${current.hour}:${String(current.minute).padStart(2, '0')}`;

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = userAnswer === correctTime;
    
    let updatedProfile = recordResponse(
      userProfile,
      isCorrect,
      2000,
      `Time: ${correctTime}`
    );
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    if (isCorrect) {
      setCorrectAnswers(correct_answers + 1);
      setFeedback('✅ Perfect time reading!');
      setTimeout(() => {
        setUserAnswer('');
        setFeedback('');
        setCurrentIdx((currentIdx + 1) % timeScenarios.length);
      }, 1500);
    } else {
      setFeedback(`❌ The time is ${correctTime}`);
    }
  };

  return (
    <Card className="p-6 bg-white space-y-6">
      <h3 className="text-2xl font-bold text-purple-600">🕐 Time Reading</h3>

      <div className="bg-purple-50 p-8 rounded-lg border-2 border-purple-300">
        <p className="text-center text-gray-700 mb-6">
          {current.text}
        </p>

        {/* Analog Clock */}
        <div className="flex justify-center mb-8">
          <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-lg">
            {/* Clock face */}
            <circle cx="100" cy="100" r="90" fill="white" stroke="black" strokeWidth="3" />
            
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x1 = 100 + 75 * Math.cos(angle);
              const y1 = 100 + 75 * Math.sin(angle);
              const x2 = 100 + 85 * Math.cos(angle);
              const y2 = 100 + 85 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="black"
                  strokeWidth="2"
                />
              );
            })}

            {/* Hour hand */}
            <line
              x1="100"
              y1="100"
              x2={100 + 40 * Math.cos((current.hour % 12 + current.minute / 60 - 3) * Math.PI / 6)}
              y2={100 + 40 * Math.sin((current.hour % 12 + current.minute / 60 - 3) * Math.PI / 6)}
              stroke="black"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Minute hand */}
            <line
              x1="100"
              y1="100"
              x2={100 + 55 * Math.cos((current.minute - 15) * Math.PI / 30)}
              y2={100 + 55 * Math.sin((current.minute - 15) * Math.PI / 30)}
              stroke="blue"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Center dot */}
            <circle cx="100" cy="100" r="5" fill="black" />
          </svg>
        </div>

        <p className="text-center text-gray-700 mb-6">
          What time does the clock show? (Use HH:MM format)
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="HH:MM"
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-center text-lg"
        />
        <Button
          onClick={handleSubmit}
          className="bg-purple-600 hover:bg-purple-700"
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
        ✓ Correct: <strong>{correct_answers}/{timeScenarios.length}</strong>
      </div>
    </Card>
  );
};

/**
 * Main Component
 */
export default function RealLifeMathSimulator() {
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('grocery');

  useEffect(() => {
    const profile = initializeUserProfile();
    setUserProfile(profile);
  }, []);

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/dyscalculia" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-green-600 mb-2">Real-Life Math Simulator</h1>
        <p className="text-gray-700">
          Practice with real-world scenarios to build practical numeracy skills
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-gray-300 p-1">
            <TabsTrigger value="grocery" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Grocery</span>
            </TabsTrigger>
            <TabsTrigger value="change" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Change</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grocery" className="space-y-6">
            <GroceryCalculator userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>

          <TabsContent value="change" className="space-y-6">
            <ChangeCalculator userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <TimeReading userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Info */}
      <div className="max-w-4xl mx-auto mt-8 bg-white/60 backdrop-blur-md border-2 border-green-200 rounded-lg p-6">
        <h3 className="font-bold text-green-900 mb-3">💡 Why Real-Life Math?</h3>
        <ul className="space-y-2 text-green-800 text-sm">
          <li>✓ Builds confidence with practical scenarios</li>
          <li>✓ Shows that math is useful for everyday life</li>
          <li>✓ Reduces math anxiety through familiar contexts</li>
          <li>✓ Improves transfer of skills to real situations</li>
        </ul>
      </div>
    </div>
  );
}
