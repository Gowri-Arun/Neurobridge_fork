# Dyscalculia Module - Usage Guide & Scenarios

## User Journey Examples

### 👤 Example 1: Asha - First-Time User (Beginner)

**Starting Point**: Clicks on Dyscalculia from main dashboard  
**Path**: `/dyscalculia`

```
1. Lands on DyscalculiaDashboard
   - Sees 5 colorful module cards
   - User stats empty (first time)
   - Tips about the system
   
2. Chooses "Number Sense Engine" 
   - Problem: "8 + 5"
   - Sees dots (8 blue dots + 5 purple dots)
   - Can also switch to blocks or number line
   - Answers in input field
   
3. Answer: ✅ CORRECT
   - Feedback: "✅ Correct! Great work!"
   - Next problem auto-loads
   - consecutive_correct counter = 1
   
4. Problem: "12 + 7"
   - Same visual representations
   - Uses number line this time
   - Answer: ❌ WRONG (says 20 instead of 19)
   
5. Feedback: "❌ Not quite. The answer is 19"
   - consecutive_incorrect counter = 1
   - User still prefers dots
   - Visual aids stay enabled

6. 3 more problems, mixed results
   - accuracy_rate = 60%
   - Hesitation time = ~4.2 seconds
   - Status: Still learning, supports enabled
```

**Adaptive Changes**: None yet - need more data

---

### 👤 Example 2: Marcus - Mid-Session with Struggles

**Starting Point**: Using Guided Step Practice

```
ACTION: Problem 38 + 24 starts
   Step 1: "What is 8 + 4?"
   User answering: "11"
   
SYSTEM: ❌ WRONG - correct is 12
   consecutive_incorrect = 1
   Hint provided with visual blocks

USER: Answers correctly on second try
   consecutive_incorrect resets to 0
   
ACTION: Problem continues with success

USER: Completes 3 problems
   - 2 correct, 1 wrong
   - Hesitation time = 6.2 seconds
   
SYSTEM MONITORS:
   - accuracy_rate = 66%
   - consecutive_incorrect = 0
   - hesitation_time > 5 seconds ← NOTABLE
   
ACTION: User takes break, exits session

SYSTEM LOGS: 
   - exit_count = 1
   - No immediate action
```

**Adaptive Status**: 
- Monitoring hesitation time
- One more trigger away from Calm Mode

---

### 👤 Example 3: Priya - Anxiety Triggered

**Scenario**: Using Real-Life Math Simulator (Grocery)

```
PROBLEM 1: Selects milk (₹28), bread (₹15)
   Asked: "What is the total?"
   Answers: ❌ 40 (should be 43)
   
consecutive_incorrect = 1
hesitation_time = 3.5 seconds

PROBLEM 2: Selects eggs (₹42), cheese (₹65)
   Asked: "What is the total?"
   Answers: ❌ 105 (should be 107)
   
consecutive_incorrect = 2
SYSTEM: Shows detailed breakdown hint
   "42 + 65 = 107"

PROBLEM 3: Selects apples (₹35), juice (₹48)
   Asked: "What is the total?"
   Takes 12 seconds to respond
   Answers: ❌ 82 (should be 83)
   
consecutive_incorrect = 3 ← CALM MODE TRIGGER!
hesitation_time = 8.5 seconds ← CALM MODE TRIGGER!

SYSTEM ACTIVATES CALM MODE:
   anxiety_flag = true
   shouldActivateCalmMode() = true
   
USER REDIRECTED: `/dyscalculia/calm-mode`

CALM MODE EXPERIENCE:
   1. Alert: "💚 Calm Mode Active..."
   2. Breathing Exercise (3 minutes)
   3. Grounding Exercise (5-4-3-2-1)
   4. Supportive Lesson about mistakes
   
   After completion:
   - anxiety_flag = false
   - difficulty_level reduced to "beginner"
   - Users encouraged to return to lesson
```

**Result**: 
- User feels supported, not judged
- System resets for fresh start
- Better environment for learning

---

### 👤 Example 4: Raj - High Performer

**Scenario**: Number Sense Engine, Advanced Mode

```
MATH PROBLEM: "25 + 18"

USER PROGRESSION:
1. First 3 problems: ✅✅✅
   - consecutive_correct = 3
   - accuracy_rate = 100%
   - Tip appears: "Let's gradually reduce visual aids"
   
2. Next problem shown with DOTS only
   - No number line initially shown
   - User can toggle if needed
   
3. Answers correctly again
   - consecutive_correct = 4
   - System observes: can_reduce_scaffolding = true
   
4. Next 2 problems: Numeric form with subtle dots
   - Visual aids reduced
   - Still available if needed
   
5. Continues with 3 more correct answers
   - consecutive_correct = 7
   - All problems still visual but less prominent
   - System ready to test symbolic-only
   
USER SESSION STATUS:
   - accuracy_rate: 94%
   - consecutive_correct: 7
   - preferred_representation: 'dots'
   - visual_aids_enabled: true (but minimal)
   - scaffold_level: MINIMAL
```

**Adaptive Changes**:
- Difficulty could increase (intermediate)
- Visual aids becoming background elements
- Approaching symbolic-only problem solving

---

## 🔄 Adaptive Decision Flowchart

```
┌─ User Completes Problem ─┐
│                          │
└──→ recordResponse()       │
     │                      │
     ├─ Update accuracy     │
     ├─ Update hesitation   │
     ├─ Update consecutive  │
     └─→ getAdaptiveRecommendations()
         │
         ├─ Check: Should enable visual aids?
         │  ✓ If 2+ consecutive errors
         │  ✓ If accuracy < 50%
         │  ✓ If hesitation > 5s
         │
         ├─ Check: Can reduce visual aids?
         │  ✓ If 3+ consecutive correct AND accuracy > 75%
         │
         ├─ Check: Should activate Calm Mode?
         │  ✓ If exit_count >= 2
         │  ✓ If consecutive_incorrect >= 3
         │  ✓ If hesitation_time > 8000ms
         │  ✓ If anxiety_flag = true
         │
         ├─ Determine scaffold level:
         │  ├─ FULL: <40% accuracy or 3+ errors
         │  ├─ MODERATE: <65% accuracy or 1+ error
         │  └─ MINIMAL: Consistent success
         │
         └─→ UI Updates with Adaptations
             (difficulty, visual aids, supports, etc.)
```

---

## 🎯 Trigger Scenarios

### Visual Aids Enabled When:

**Scenario A**: 2+ Consecutive Errors
```
Problem 1: ❌
Problem 2: ❌
→ Next problem shows ALL visual representations
  (dots, blocks, number line)
→ Symbolic form hidden initially
```

**Scenario B**: Accuracy Drops Below 50%
```
5 problems attempted: 2 correct, 3 wrong
Accuracy = 40%
→ Visual representations activated
→ Difficulty reduced to 'beginner'
→ Hint frequency increased
```

**Scenario C**: Hesitation Time Exceeds 5 Seconds
```
User takes 6.5 seconds to answer
→ System detects struggle
→ Visual aids auto-enabled for next problem
→ Supportive tip: "Take your time, visuals are here to help"
```

### Calm Mode Triggered When:

**Trigger A**: Multiple Session Exits
```
Session 1: User exits mid-problem
  exit_count = 1
Session 2: User exits again after 2 problems
  exit_count = 2 ← THRESHOLD MET
→ Calm Mode activates on next activity attempt
```

**Trigger B**: 3+ Consecutive Errors
```
Problem 1: ❌ (consecutive_incorrect = 1)
Problem 2: ❌ (consecutive_incorrect = 2)
Problem 3: ❌ (consecutive_incorrect = 3) ← THRESHOLD MET
→ Immediate Calm Mode activation
→ Alert: "We noticed some challenges..."
```

**Trigger C**: Long Hesitation
```
User staring at problem for 9 seconds
→ System recognizes hesitation > 8 seconds
→ Does NOT pressure user ("No timer!")
→ After submission, if pattern continues:
   shouldActivateCalmMode() = true
```

---

## 📊 Data Examples

### User Profile After First Session

```javascript
{
  accuracy_rate: 0.65,           // 65% - decent start
  hesitation_time: 4200,         // ~4.2 seconds average
  error_patterns: [
    { problem: "12 + 8", timestamp: "2024-03-02T10:15:00Z" },
    { problem: "15 + 7", timestamp: "2024-03-02T10:18:30Z" }
  ],
  preferred_representation: 'dots',
  anxiety_flag: false,
  session_count: 20,             // 20 problems attempted
  consecutive_correct: 0,
  consecutive_incorrect: 0,
  exit_count: 0,
  total_interaction_time: 84000, // 1m 24s
  representation_history: {
    dots: 15,                    // Most used
    blocks: 3,
    number_line: 2
  }
}
```

### Adaptive Recommendations Generated

```javascript
{
  visual_aids_enabled: false,           // Accuracy is good
  calm_mode_active: false,              // No anxiety triggers
  can_reduce_scaffolding: false,        // Not enough consecutive success
  scaffold_level: 2,                    // MODERATE (65% accuracy)
  difficulty: 'beginner',               // Keep at beginner
  preferred_representation: 'dots',
  number_sense_reduction: false,        // Not ready yet
  anxiety_support_needed: false
}
```

**Recommendation**: User should continue with beginner level, keep visual aids enabled, monitor for patterns.

---

## 🏃 Quick Start Checklist

### For System Admin/Parent
- [ ] User goes to `/dyscalculia`
- [ ] System auto-creates profile in localStorage
- [ ] User can immediately start learning (no sign-up)
- [ ] All progress tracked locally

### For Teachers/Assessors
- [ ] View student progress by checking browser localStorage
- [ ] `dyscalculia_user_profile_default` key
- [ ] Check: accuracy_rate, error_patterns, preferred_representation
- [ ] Note: Calm Mode triggers indicate anxiety

### For Developers
- [ ] All components use `initializeUserProfile()`
- [ ] After user input: `recordResponse()` + `saveUserProfile()`
- [ ] Before UI update: `getAdaptiveRecommendations()`
- [ ] Monitor: `shouldActivateCalmMode()` continuously
- [ ] Routes available: `/dyscalculia/*`

---

## 🔐 Privacy & Safety Features

1. **No Internet Required**: All data stored locally
2. **No Tracking**: No external analytics by default
3. **Supportive Feedback**: Never harsh or judgmental
4. **Anxiety-Aware**: Removes timers, pressure
5. **User Control**: Can change difficulty, switch exercises anytime
6. **No Red Errors**: Uses orange/yellow for corrections
7. **Growth Mindset**: All messages emphasize learning, not performance

---

## 🌟 Success Indicators

### User is Thriving When:
- Accuracy rate increasing over sessions
- Hesitation time decreasing
- consecutive_correct growing
- Preferring fewer visual aids
- Completing full practice sessions
- Engaging with real-life scenarios
- Positive mood during Calm Mode triggers

### Intervention Needed When:
- Accuracy consistently <40%
- Hesitation time consistently >8s
- Multiple Calm Mode activations in one session
- High exit_count
- Error patterns on same problem type
- anxiety_flag repeatedly triggering

---

**Ready to Support All Learners** 💚🔢

This module prioritizes emotional safety alongside mathematical learning.
Every adaptation is powered by real performance data, not assumptions.
