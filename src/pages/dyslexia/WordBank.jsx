/**
 * Word Bank Component
 * 
 * Personal dictionary for frequently struggled words with phonetic breakdowns,
 * etymology, and usage examples.
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Trash2, CheckCircle, XCircle, RefreshCw, Sparkles, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  loadWordBank,
  addWordToBank,
  removeWordFromBank,
  updateWordEntry,
  markWordReviewed,
  getWordBankStats,
  searchWords,
  enrichWordEntry,
  getWordsByMastery
} from '@/lib/wordBank';

const WordBank = () => {
  const [words, setWords] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [newWord, setNewWord] = useState('');
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [filterTab, setFilterTab] = useState('all');
  const [enrichingWordId, setEnrichingWordId] = useState(null);

  // Load words on mount
  useEffect(() => {
    refreshWordBank();
  }, []);

  const refreshWordBank = () => {
    const loadedWords = loadWordBank();
    setWords(loadedWords);
    setStats(getWordBankStats());
  };

  const handleAddWord = () => {
    if (newWord.trim()) {
      addWordToBank(newWord, {
        notes: 'Manually added to word bank'
      });
      setNewWord('');
      setIsAddingWord(false);
      refreshWordBank();
    }
  };

  const handleDeleteWord = (wordId) => {
    removeWordFromBank(wordId);
    if (selectedWord?.id === wordId) {
      setSelectedWord(null);
    }
    refreshWordBank();
  };

  const handleMarkReview = (wordId, isCorrect) => {
    markWordReviewed(wordId, isCorrect);
    refreshWordBank();
    
    // Update selected word if it's the one being reviewed
    if (selectedWord?.id === wordId) {
      const updated = loadWordBank().find(w => w.id === wordId);
      setSelectedWord(updated);
    }
  };

  const handleEnrichWord = async (wordId) => {
    setEnrichingWordId(wordId);
    await enrichWordEntry(wordId);
    refreshWordBank();
    
    // Update selected word
    const updated = loadWordBank().find(w => w.id === wordId);
    setSelectedWord(updated);
    setEnrichingWordId(null);
  };

  const handleUpdateNotes = (wordId, notes) => {
    updateWordEntry(wordId, { notes });
    refreshWordBank();
  };

  // Filter words based on tab and search
  const filteredWords = React.useMemo(() => {
    let filtered = words;

    // Apply tab filter
    if (filterTab === 'struggling') {
      filtered = filtered.filter(w => w.masteryLevel < 50);
    } else if (filterTab === 'learning') {
      filtered = filtered.filter(w => w.masteryLevel >= 50 && w.masteryLevel < 80);
    } else if (filterTab === 'mastered') {
      filtered = filtered.filter(w => w.masteryLevel >= 80);
    }

    // Apply search
    if (searchQuery) {
      const results = searchWords(searchQuery);
      filtered = filtered.filter(w => results.some(r => r.id === w.id));
    }

    return filtered;
  }, [words, filterTab, searchQuery]);

  const getMasteryColor = (level) => {
    if (level >= 80) return 'text-green-600 bg-green-100';
    if (level >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMasteryLabel = (level) => {
    if (level >= 80) return 'Mastered';
    if (level >= 50) return 'Learning';
    return 'Struggling';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/dyslexia" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Word Bank</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Your personal dictionary for mastering difficult words
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalWords}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.masteredWords}</div>
              <div className="text-sm text-gray-600">Mastered</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.strugglingWords}</div>
              <div className="text-sm text-gray-600">Struggling</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.averageMastery}%</div>
              <div className="text-sm text-gray-600">Avg Mastery</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-cyan-600">{stats.recentlyAdded}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              {/* Search & Add */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search words..."
                    className="pl-10"
                  />
                </div>

                {!isAddingWord ? (
                  <Button
                    onClick={() => setIsAddingWord(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Word
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Enter word..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddWord} className="flex-1" size="sm">
                        Add
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingWord(false);
                          setNewWord('');
                        }}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Tabs */}
              <Tabs value={filterTab} onValueChange={setFilterTab} className="mb-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="struggling">Need Help</TabsTrigger>
                  <TabsTrigger value="learning">Learning</TabsTrigger>
                  <TabsTrigger value="mastered">Mastered</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Words List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredWords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? 'No words found' : 'No words yet. Add your first word!'}
                    </p>
                  </div>
                ) : (
                  filteredWords.map((word) => (
                    <Card
                      key={word.id}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedWord?.id === word.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedWord(word)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{word.word}</div>
                          <div className="text-xs text-gray-500">
                            Encountered {word.timesEncountered}x
                          </div>
                        </div>
                        <Badge className={getMasteryColor(word.masteryLevel)}>
                          {word.masteryLevel}%
                        </Badge>
                      </div>
                      <Progress value={word.masteryLevel} className="mt-2 h-1" />
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Word Details */}
          <div className="lg:col-span-2">
            {selectedWord ? (
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedWord.word}
                      </h2>
                      <Badge className={`${getMasteryColor(selectedWord.masteryLevel)} text-sm px-3 py-1`}>
                        {getMasteryLabel(selectedWord.masteryLevel)} - {selectedWord.masteryLevel}%
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEnrichWord(selectedWord.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={enrichingWordId === selectedWord.id}
                      >
                        {enrichingWordId === selectedWord.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Enhance
                      </Button>
                      <Button
                        onClick={() => handleDeleteWord(selectedWord.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mastery Progress</span>
                      <span className="font-semibold">{selectedWord.masteryLevel}%</span>
                    </div>
                    <Progress value={selectedWord.masteryLevel} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>✓ Correct: {selectedWord.timesCorrect}</span>
                      <span>✗ Incorrect: {selectedWord.timesIncorrect}</span>
                    </div>
                  </div>

                  {/* Phonetic Breakdown */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      🔊 Phonetic Guide
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Pronunciation: </span>
                        <span className="text-lg font-mono text-blue-700">
                          {selectedWord.phonetic}
                        </span>
                      </div>
                      {selectedWord.syllables && selectedWord.syllables.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Syllables: </span>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {selectedWord.syllables.map((syllable, idx) => (
                              <Badge key={idx} variant="outline" className="font-mono">
                                {syllable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Etymology */}
                  {(selectedWord.etymology || selectedWord.origin) && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        📚 Etymology & Origin
                      </h3>
                      <p className="text-sm text-gray-700">
                        {selectedWord.etymology || selectedWord.origin}
                      </p>
                    </div>
                  )}

                  {/* Usage Examples */}
                  {selectedWord.examples && selectedWord.examples.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        💡 Usage Examples
                      </h3>
                      <ul className="space-y-2">
                        {selectedWord.examples.map((example, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-green-600 font-bold">{idx + 1}.</span>
                            <span className="italic">"{example}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Personal Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Personal Notes</label>
                    <Textarea
                      value={selectedWord.notes || ''}
                      onChange={(e) => handleUpdateNotes(selectedWord.id, e.target.value)}
                      placeholder="Add your own notes, memory tricks, or observations..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Review Actions */}
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Practice Review</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Did you read/pronounce this word correctly during practice?
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleMarkReview(selectedWord.id, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Got It Right
                      </Button>
                      <Button
                        onClick={() => handleMarkReview(selectedWord.id, false)}
                        className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Still Struggling
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
                    <div>Added: {new Date(selectedWord.addedAt).toLocaleDateString()}</div>
                    {selectedWord.lastReviewed && (
                      <div>Last reviewed: {new Date(selectedWord.lastReviewed).toLocaleDateString()}</div>
                    )}
                    <div>Times encountered: {selectedWord.timesEncountered}</div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a word to view details
                </h3>
                <p className="text-gray-500">
                  Click on any word from the list to see phonetic breakdown, etymology, and usage examples
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordBank;
