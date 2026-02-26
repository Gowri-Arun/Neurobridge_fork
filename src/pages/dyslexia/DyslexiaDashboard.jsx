/**
 * Dyslexia Dashboard
 * 
 * Main hub for dyslexia-friendly tools including the Adaptive Reading Engine.
 */

import React, { useState } from 'react';
import { BookOpen, Brain, Trophy, Settings, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tools = [
  {
    to: '/dyslexia/reader',
    icon: '📖',
    title: 'Reader Mode',
    description: 'Adaptive reading engine with real-time struggle detection and personalized text adjustments',
    status: 'active',
    features: ['Live difficulty detection', 'Auto text adjustment', 'Session insights', 'TTS support'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    to: '#',
    icon: '🎨',
    title: 'Font Customizer',
    description: 'OpenDyslexic font with customizable spacing and contrast options',
    status: 'coming-soon',
    features: ['Font library', 'Spacing control', 'Color themes'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    to: '/dyslexia/word-bank',
    icon: '📝',
    title: 'Word Bank',
    description: 'Personal dictionary for frequently struggled words with phonetic breakdowns',
    status: 'active',
    features: ['Phonetic guide', 'Etymology', 'Usage examples'],
    color: 'from-orange-500 to-red-500'
  },
  {
    to: '#',
    icon: '🎯',
    title: 'Reading Exercises',
    description: 'Gamified reading challenges to build confidence and speed',
    status: 'coming-soon',
    features: ['Level tracking', 'Rewards', 'Progress analytics'],
    color: 'from-green-500 to-teal-500'
  },
  {
    to: '#',
    icon: '📊',
    title: 'Progress Tracker',
    description: 'Visual analytics of reading patterns and improvement over time',
    status: 'coming-soon',
    features: ['Struggle trends', 'Improvement metrics', 'Recommendations'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    to: '#',
    icon: '🧠',
    title: 'Cognitive Load Coach',
    description: 'Dynamic guidance based on your unique reading profile',
    status: 'coming-soon',
    features: ['Adaptive pacing', 'Smart breaks', 'Personalization'],
    color: 'from-rose-500 to-orange-500'
  },
];

export default function DyslexiaDashboard() {
  const [hoveredTool, setHoveredTool] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative py-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-40 right-10 w-32 h-32 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">
              ✨ Adaptive Learning Technology
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            ReadEase
          </h1>

          <p className="text-xl text-gray-700 mb-2 font-semibold">
            Dyslexia-Friendly Reading Platform
          </p>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Powered by an intelligent Adaptive Reading Engine that learns your patterns, detects struggles in real-time, and adjusts text presentation automatically for optimal comprehension.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/dyslexia/reader">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg">
                <BookOpen className="mr-2 w-5 h-5" />
                Start Reading Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Monitor</h3>
              <p className="text-gray-600">Tracks your reading behavior and interaction patterns</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Detect</h3>
              <p className="text-gray-600">Identifies struggle signals like slow reading pace</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Adapt</h3>
              <p className="text-gray-600">Automatically adjusts text for better comprehension</p>
            </div>
          </div>
        </div>
      </div>

      {/* Struggle Detection System */}
      <div className="max-w-6xl mx-auto px-6 py-12 bg-white rounded-2xl shadow-lg my-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Intelligent Struggle Detection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-red-500 bg-red-50">
            <div className="text-3xl mb-3">🐢</div>
            <h4 className="font-bold text-gray-900 mb-2">Decoding Difficulty</h4>
            <p className="text-sm text-gray-600 mb-4">
              Detects when time per sentence exceeds normal pace
            </p>
            <div className="text-xs bg-red-100 text-red-900 px-3 py-1 rounded inline-block">
              &gt; 8 seconds per sentence
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500 bg-orange-50">
            <div className="text-3xl mb-3">👆</div>
            <h4 className="font-bold text-gray-900 mb-2">Word Struggle</h4>
            <p className="text-sm text-gray-600 mb-4">
              Identifies words that cause repeated difficulty
            </p>
            <div className="text-xs bg-orange-100 text-orange-900 px-3 py-1 rounded inline-block">
              ≥ 2 taps per word
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500 bg-purple-50">
            <div className="text-3xl mb-3">↩️</div>
            <h4 className="font-bold text-gray-900 mb-2">Comprehension Issue</h4>
            <p className="text-sm text-gray-600 mb-4">
              Catches quick back-scrolling indicating confusion
            </p>
            <div className="text-xs bg-purple-100 text-purple-900 px-3 py-1 rounded inline-block">
              Scroll up within 5s
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500 bg-blue-50">
            <div className="text-3xl mb-3">🎧</div>
            <h4 className="font-bold text-gray-900 mb-2">Auditory Dependency</h4>
            <p className="text-sm text-gray-600 mb-4">
              Detects over-reliance on text-to-speech
            </p>
            <div className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded inline-block">
              ≥ 3 TTS activations
            </div>
          </Card>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Complete Toolkit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(({ to, icon, title, description, status, features, color }) => (
            <Link
              key={title}
              to={status === 'active' ? to : '#'}
              className={status === 'coming-soon' ? 'pointer-events-none' : ''}
              onMouseEnter={() => setHoveredTool(title)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <Card className={`group h-full p-6 transition-all duration-300 cursor-pointer ${
                status === 'active'
                  ? 'hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-blue-300'
                  : 'opacity-75 hover:opacity-85'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{icon}</div>
                  {status === 'active' ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${
                  hoveredTool === title && status === 'active' ? `bg-gradient-to-r ${color} bg-clip-text text-transparent` : 'text-gray-900'
                }`}>
                  {title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {description}
                </p>

                <div className="space-y-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
                      {feature}
                    </div>
                  ))}
                </div>

                {status === 'active' && (
                  <div className={`mt-6 flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
                    hoveredTool === title ? 'text-blue-600 gap-3' : 'text-blue-500'
                  }`}>
                    Launch Tool
                    <ArrowRight className="w-4 h-4 transition-transform" />
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

     
      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to improve your reading experience?
        </h2>
        <p className="text-gray-600 mb-8">
          Start with Reader Mode and let the adaptive engine learn your unique reading patterns.
        </p>
        <Link to="/dyslexia/reader">
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg">
            <BookOpen className="mr-2 w-5 h-5" />
            Open Reader Mode
          </Button>
        </Link>
      </div>
    </div>
  );
}
