/**
 * Word Bank Library
 * 
 * Manages personal dictionary of struggled words with phonetic breakdowns,
 * etymology, and usage examples.
 */

const WORD_BANK_STORAGE_KEY = 'readease_word_bank';
const MAX_WORD_BANK_SIZE = 500;

/**
 * Create a word entry with all details
 */
export const createWordEntry = (word, options = {}) => {
  const normalizedWord = word.toLowerCase().trim();
  
  return {
    id: `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    word: normalizedWord,
    addedAt: new Date().toISOString(),
    lastReviewed: null,
    timesEncountered: 1,
    timesCorrect: 0,
    timesIncorrect: 0,
    masteryLevel: 0, // 0-100
    
    // Phonetic breakdown
    phonetic: options.phonetic || generatePhoneticGuide(normalizedWord),
    syllables: options.syllables || breakIntoSyllables(normalizedWord),
    
    // Etymology
    etymology: options.etymology || null,
    origin: options.origin || null,
    
    // Usage examples
    examples: options.examples || [],
    
    // User notes
    notes: options.notes || '',
    
    // Context from when word was added
    sourceContext: options.sourceContext || null,
    
    // Tags for organization
    tags: options.tags || []
  };
};

/**
 * Generate phonetic guide for a word
 * Simple implementation - can be enhanced with dictionary API
 */
export const generatePhoneticGuide = (word) => {
  // Common phonetic patterns (simplified)
  const phonetics = {
    // Vowels
    'a': 'ay/ah/uh',
    'e': 'ee/eh',
    'i': 'eye/ih',
    'o': 'oh/aw',
    'u': 'you/uh',
    
    // Common combinations
    'th': 'th',
    'sh': 'sh',
    'ch': 'ch',
    'ph': 'f',
    'qu': 'kw',
    'tion': 'shun',
    'sion': 'zhun',
    'ough': 'uff/oh/ow',
    'igh': 'eye',
    'eigh': 'ay',
    'ough': 'uff',
  };
  
  // Try to break down the word phonetically
  let phonetic = '';
  let i = 0;
  
  while (i < word.length) {
    // Check for 4-letter combinations
    if (i <= word.length - 4) {
      const fourChar = word.substr(i, 4);
      if (phonetics[fourChar]) {
        phonetic += phonetics[fourChar] + '-';
        i += 4;
        continue;
      }
    }
    
    // Check for 3-letter combinations
    if (i <= word.length - 3) {
      const threeChar = word.substr(i, 3);
      if (phonetics[threeChar]) {
        phonetic += phonetics[threeChar] + '-';
        i += 3;
        continue;
      }
    }
    
    // Check for 2-letter combinations
    if (i <= word.length - 2) {
      const twoChar = word.substr(i, 2);
      if (phonetics[twoChar]) {
        phonetic += phonetics[twoChar] + '-';
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = word[i];
    if (phonetics[char]) {
      phonetic += phonetics[char] + '-';
    } else {
      phonetic += char + '-';
    }
    i++;
  }
  
  return phonetic.replace(/-$/, '');
};

/**
 * Break word into syllables
 */
export const breakIntoSyllables = (word) => {
  // Simple syllable breaking (can be enhanced)
  const syllables = [];
  const vowels = 'aeiouy';
  let currentSyllable = '';
  
  for (let i = 0; i < word.length; i++) {
    currentSyllable += word[i];
    
    // If we have a vowel followed by consonant, it's likely a syllable break
    if (vowels.includes(word[i].toLowerCase())) {
      if (i + 1 < word.length && !vowels.includes(word[i + 1].toLowerCase())) {
        // Check if next consonant is followed by a vowel
        if (i + 2 < word.length && vowels.includes(word[i + 2].toLowerCase())) {
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
      }
    }
  }
  
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  return syllables.length > 0 ? syllables : [word];
};

/**
 * Save word bank to localStorage
 */
export const saveWordBank = (wordBank) => {
  try {
    // Limit size
    const limitedBank = wordBank.slice(0, MAX_WORD_BANK_SIZE);
    localStorage.setItem(WORD_BANK_STORAGE_KEY, JSON.stringify(limitedBank));
    return true;
  } catch (error) {
    console.error('Failed to save word bank:', error);
    return false;
  }
};

/**
 * Load word bank from localStorage
 */
export const loadWordBank = () => {
  try {
    const stored = localStorage.getItem(WORD_BANK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load word bank:', error);
    return [];
  }
};

/**
 * Add a word to the bank
 */
export const addWordToBank = (word, options = {}) => {
  const wordBank = loadWordBank();
  const normalizedWord = word.toLowerCase().trim();
  
  // Check if word already exists
  const existingIndex = wordBank.findIndex(entry => entry.word === normalizedWord);
  
  if (existingIndex !== -1) {
    // Update existing entry
    wordBank[existingIndex].timesEncountered += 1;
    wordBank[existingIndex].lastReviewed = new Date().toISOString();
    
    // Update context if provided
    if (options.sourceContext) {
      wordBank[existingIndex].sourceContext = options.sourceContext;
    }
  } else {
    // Add new entry
    const newEntry = createWordEntry(word, options);
    wordBank.unshift(newEntry); // Add to beginning
  }
  
  saveWordBank(wordBank);
  return wordBank;
};

/**
 * Remove a word from the bank
 */
export const removeWordFromBank = (wordId) => {
  const wordBank = loadWordBank();
  const filtered = wordBank.filter(entry => entry.id !== wordId);
  saveWordBank(filtered);
  return filtered;
};

/**
 * Update word entry
 */
export const updateWordEntry = (wordId, updates) => {
  const wordBank = loadWordBank();
  const index = wordBank.findIndex(entry => entry.id === wordId);
  
  if (index !== -1) {
    wordBank[index] = { ...wordBank[index], ...updates };
    saveWordBank(wordBank);
  }
  
  return wordBank;
};

/**
 * Mark word as reviewed
 */
export const markWordReviewed = (wordId, isCorrect) => {
  const wordBank = loadWordBank();
  const index = wordBank.findIndex(entry => entry.id === wordId);
  
  if (index !== -1) {
    wordBank[index].lastReviewed = new Date().toISOString();
    
    if (isCorrect) {
      wordBank[index].timesCorrect += 1;
    } else {
      wordBank[index].timesIncorrect += 1;
    }
    
    // Update mastery level (0-100)
    const total = wordBank[index].timesCorrect + wordBank[index].timesIncorrect;
    if (total > 0) {
      wordBank[index].masteryLevel = Math.round((wordBank[index].timesCorrect / total) * 100);
    }
    
    saveWordBank(wordBank);
  }
  
  return wordBank;
};

/**
 * Get words by mastery level
 */
export const getWordsByMastery = (minMastery = 0, maxMastery = 100) => {
  const wordBank = loadWordBank();
  return wordBank.filter(entry => 
    entry.masteryLevel >= minMastery && entry.masteryLevel <= maxMastery
  );
};

/**
 * Get recently added words
 */
export const getRecentWords = (limit = 10) => {
  const wordBank = loadWordBank();
  return wordBank.slice(0, limit);
};

/**
 * Search words
 */
export const searchWords = (query) => {
  const wordBank = loadWordBank();
  const lowerQuery = query.toLowerCase();
  
  return wordBank.filter(entry =>
    entry.word.includes(lowerQuery) ||
    entry.notes?.toLowerCase().includes(lowerQuery) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get word bank statistics
 */
export const getWordBankStats = () => {
  const wordBank = loadWordBank();
  
  if (wordBank.length === 0) {
    return {
      totalWords: 0,
      averageMastery: 0,
      masteredWords: 0,
      strugglingWords: 0,
      recentlyAdded: 0
    };
  }
  
  const totalMastery = wordBank.reduce((sum, entry) => sum + entry.masteryLevel, 0);
  const masteredWords = wordBank.filter(entry => entry.masteryLevel >= 80).length;
  const strugglingWords = wordBank.filter(entry => entry.masteryLevel < 50).length;
  
  // Words added in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyAdded = wordBank.filter(entry => 
    new Date(entry.addedAt) > sevenDaysAgo
  ).length;
  
  return {
    totalWords: wordBank.length,
    averageMastery: Math.round(totalMastery / wordBank.length),
    masteredWords,
    strugglingWords,
    recentlyAdded
  };
};

/**
 * Fetch enhanced word data from dictionary API
 * This can be called to enrich word entries with real dictionary data
 */
export const fetchWordDefinition = async (word) => {
  try {
    // Using Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const firstEntry = data[0];
    
    return {
      phonetic: firstEntry.phonetic || null,
      phonetics: firstEntry.phonetics || [],
      origin: firstEntry.origin || null,
      meanings: firstEntry.meanings || [],
      examples: extractExamples(firstEntry.meanings),
    };
  } catch (error) {
    console.error('Failed to fetch word definition:', error);
    return null;
  }
};

/**
 * Extract usage examples from meanings
 */
const extractExamples = (meanings) => {
  const examples = [];
  
  if (meanings) {
    meanings.forEach(meaning => {
      meaning.definitions?.forEach(def => {
        if (def.example) {
          examples.push(def.example);
        }
      });
    });
  }
  
  return examples.slice(0, 5); // Limit to 5 examples
};

/**
 * Enrich word entry with dictionary data
 */
export const enrichWordEntry = async (wordId) => {
  const wordBank = loadWordBank();
  const index = wordBank.findIndex(entry => entry.id === wordId);
  
  if (index === -1) return wordBank;
  
  const word = wordBank[index].word;
  const dictionaryData = await fetchWordDefinition(word);
  
  if (dictionaryData) {
    wordBank[index] = {
      ...wordBank[index],
      phonetic: dictionaryData.phonetic || wordBank[index].phonetic,
      origin: dictionaryData.origin || wordBank[index].origin,
      examples: dictionaryData.examples.length > 0 ? dictionaryData.examples : wordBank[index].examples,
      etymology: dictionaryData.origin || wordBank[index].etymology
    };
    
    saveWordBank(wordBank);
  }
  
  return wordBank;
};
