/**
 * Dyscalculia Dashboard
 * 
 * Main hub for dyscalculia-friendly tools including:
 * - Number Sense Engine (visual magnitude representations)
 * - Guided Step Practice (step-by-step scaffolding)
 * - Real-Life Math Simulator (practical scenarios)
 * - Calm Mode (anxiety support)
 * - Pattern Recognition Trainer (pattern exercises)
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Smile,
  CircleDot,
  Footprints,
  ShoppingCart,
  HeartPulse,
  Shapes,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  initializeUserProfile,
  getAdaptiveRecommendations,
  shouldActivateCalmMode
} from '@/lib/dyscalculiaAdaptiveEngine';

const tools = [
  {
    to: '/dyscalculia/number-sense',
    icon: CircleDot,
    title: 'Number Sense Engine',
    description: 'Convert abstract numbers into visual magnitude representations using dots, blocks, and number lines',
    status: 'active',
    features: ['Dot clusters', 'Block stacking', 'Number line jumps', 'Adaptive visuals'],
    color: 'from-orange-500 to-amber-500',
    iconColor: 'text-orange-700'
  },
  {
    to: '/dyscalculia/step-practice',
    icon: Footprints,
    title: 'Guided Step Practice',
    description: 'Break calculations into micro-steps to reduce working memory load. Step-by-step scaffolding for confidence',
    status: 'active',
    features: ['Digit highlighting', 'Step guidance', 'Visual blocks', 'No skip option'],
    color: 'from-blue-500 to-cyan-500',
    iconColor: 'text-cyan-700'
  },
  {
    to: '/dyscalculia/real-life-math',
    icon: ShoppingCart,
    title: 'Real-Life Math Simulator',
    description: 'Build practical numerical confidence with grocery totals, change calculations, and budgeting scenarios',
    status: 'active',
    features: ['Grocery totals', 'Change calculator', 'Time reading', 'Budgeting'],
    color: 'from-green-500 to-emerald-500',
    iconColor: 'text-emerald-700'
  },
  {
    to: '/dyscalculia/calm-mode',
    icon: HeartPulse,
    title: 'Calm Mode',
    description: 'Anxiety-aware system that detects stress and adjusts presentation with supportive guidance',
    status: 'active',
    features: ['Auto activation', 'Slow transitions', 'No timers', 'Supportive text'],
    color: 'from-rose-500 to-pink-500',
    iconColor: 'text-rose-700'
  },
  {
    to: '/dyscalculia/patterns',
    icon: Shapes,
    title: 'Pattern Recognition Trainer',
    description: 'Build pattern detection skills with sequences, visual growth patterns, and shape-number matching',
    status: 'active',
    features: ['Missing numbers', 'Block growth', 'Shape matching', 'Skip counting'],
    color: 'from-purple-500 to-indigo-500',
    iconColor: 'text-indigo-700'
  },
];

export default function DyscalculiaDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [adaptiveRecommendations, setAdaptiveRecommendations] = useState(null);

  useEffect(() => {
    // Initialize user profile on component mount
    const profile = initializeUserProfile();
    setUserProfile(profile);
    
    // Get adaptive recommendations
    const recommendations = getAdaptiveRecommendations(profile);
    setAdaptiveRecommendations(recommendations);
  }, []);

  if (!userProfile || !adaptiveRecommendations) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const showCalmModeAlert = shouldActivateCalmMode(userProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative py-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-40 right-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <Badge className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm">
              ✨ Visual Math Learning
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
            NumberSense
          </h1>

          <p className="text-xl text-gray-700 mb-2 font-semibold">
            Dyscalculia-Friendly Math Platform
          </p>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Build number sense through visual representations, step-by-step guidance, and real-world scenarios. Adaptive learning that reduces anxiety and builds confidence.
          </p>

          {/* User Performance Stats */}
          {userProfile.session_count > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50">
              <div>
                <div className="text-sm text-gray-600">Accuracy</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(userProfile.accuracy_rate * 100)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Sessions</div>
                <div className="text-2xl font-bold text-orange-600">
                  {userProfile.session_count}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Streak</div>
                <div className="text-2xl font-bold text-orange-600">
                  {userProfile.consecutive_correct}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Preferred View</div>
                <div className="text-lg font-bold text-orange-600 capitalize">
                  {userProfile.preferred_representation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calm Mode Alert */}
      {showCalmModeAlert && (
        <div className="px-6 pb-6">
          <Alert className="bg-rose-50 border-rose-200">
            <Smile className="h-5 w-5 text-rose-600" />
            <AlertDescription className="text-rose-700 ml-3">
              <strong>💚 Calm Mode Active:</strong> We detected some challenges. Let's take a slower approach with more visual support. No timer, no pressure. You've got this!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Adaptive Recommendations */}
      {(adaptiveRecommendations.visual_aids_enabled || adaptiveRecommendations.anxiety_support_needed) && (
        <div className="px-6 pb-6">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800 ml-3">
              <strong>🎯 Personalized Tip:</strong>
              {adaptiveRecommendations.visual_aids_enabled && ' Visual aids are enabled to help with this problem.'}
              {adaptiveRecommendations.anxiety_support_needed && ' Take your time - there\'s no rush here.'}
              {adaptiveRecommendations.can_reduce_scaffolding && ' You\'re doing great! Let\'s gradually reduce the support.'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group relative"
            >
              <Card className="h-full overflow-hidden border-2 border-white/60 hover:border-orange-200 bg-white/85 backdrop-blur-md hover:bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Gradient background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                <div className="relative p-8">
                  {/* Icon and Title */}
                  <div className="mb-5 inline-flex items-center justify-center rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm group-hover:shadow-md transition-all">
                    <tool.icon className={`h-7 w-7 ${tool.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 mb-3 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6 space-y-2">
                    {tool.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm text-gray-700">
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Status Badge and Button */}
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {tool.status === 'active' ? '✓ Active' : '🔄 Coming Soon'}
                    </Badge>
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full font-medium text-sm group-hover:shadow-lg transition-shadow">
                      Launch <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white/50 backdrop-blur-md border-t border-white/30 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-700 mb-3">
            <strong>💡 About NumberSense:</strong> This adaptive learning platform uses visual representations, step-by-step guidance, and real-world scenarios to build math confidence without anxiety.
          </p>
          <p className="text-sm text-gray-600">
            Every interaction helps us learn your preferences. The system automatically adjusts difficulty and support based on your performance.
          </p>
        </div>
      </div>
    </div>
  );
}
