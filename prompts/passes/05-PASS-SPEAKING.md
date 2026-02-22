# PASS 4: SPEAKING — Conversation Scenarios & Fluency Drills

> **Platform feature:** Speaking Practice (Real-time voice conversation with AI)  
> **Inherits:** `00-BASE-SYSTEM.md`  
> **Requires:** Output from Pass 1, 2, and 3

---

## ⚠️ CRITICAL REQUIREMENTS (READ FIRST — MANDATORY)

These are **non-negotiable**. Failing to meet them = FAILED validation or warnings.

1. **Scenarios:** Generate the number of scenarios indicated by `speaking_params.variation_count` for this level. Do not generate fewer.
2. **Fixation exercises:** Generate exactly **5–8** exercises after the conversation (fill_blank, multiple_choice, reorder_sentence, match_expression). Missing or fewer = warning.
3. **Evaluation criteria + fluency gym:** Must be present; missing = warnings.

Same rules for every target language. No negotiation.

---

## CONTEXT INJECTION FROM ALL PREVIOUS PASSES

```json
{
  "moduleId": "{moduleId}",
  "title": "{title}",
  "cefrLevel": "{cefrLevel}",
  "targetLanguage": "{targetLanguage}",
  "nativeLanguage": "{nativeLanguage}",
  "situationalTheme": "{situationalTheme}",
  
  "from_pass_1": {
    "chunks_taught": ["all chunk objects"],
    "grammar_patterns": ["patterns covered"],
    "common_mistakes": ["L1 errors identified"],
    "identity_shift": {"before_state": "...", "after_state": "..."}
  },
  "from_pass_2": {
    "reading_scenario": "brief summary of reading context",
    "vocabulary_additions": ["new vocab from reading"]
  },
  "from_pass_3": {
    "podcast_scenario": "brief summary of podcast content",
    "speakers_used": ["speaker personalities from podcast"]
  },
  
  "speaking_params": {
    "duration_seconds": "{level-specific duration}",
    "types": ["{available speaking types for this level}"],
    "ai_behavior": "{level-specific AI behavior description}",
    "variation_count": { "min": "{min}", "max": "{max}" }
  }
}
```

---

## GENERATION INSTRUCTIONS

### 1. SPEAKING SCENARIOS

Generate `{variationCount}` distinct scenarios:

```json
{
  "scenarios": [
    {
      "scenario_id": "speak_{moduleId}_001",
      "title": "Short, engaging title",
      "type": "roleplay | monologue | debate | negotiation | storytelling | qa | crisis",
      "duration_target_seconds": "number",
      "difficulty": 1-5,
      
      "situation": {
        "description_for_learner": "Clear scenario description in {nativeLanguage}",
        "description_for_learner_target_lang": "Same description in {targetLanguage} (for B1+)",
        "setting": "Physical location and context",
        "relationship": "Who the learner is talking to",
        "stakes": "What's at stake (low | medium | high)",
        "goal": "What the learner needs to accomplish",
        "emotional_context": "The emotional undertone",
        "time_pressure": "Is there urgency? (none | mild | strong)"
      },

      "ai_character": {
        "name": "Character name",
        "personality": "3-5 word personality description",
        "background": "Brief background relevant to the scenario",
        "speech_style": "How this character talks (formal, slangy, direct, evasive, etc.)",
        "mood": "Starting mood (friendly, impatient, skeptical, etc.)",
        
        "opening_line": "The first thing the AI says to start the conversation",
        
        "behavior_rules": {
          "general": "Overall behavior description",
          "interruption_frequency": "never | rarely | sometimes | often",
          "follow_up_style": "How the AI pushes the conversation forward",
          "unpredictability": "Specific unexpected things the AI might do",
          "register": "The formality level the AI uses"
        },
        
        "reaction_guidelines": {
          "if_learner_struggles": {
            "strategy": "How to help WITHOUT breaking character",
            "example": "An example of natural scaffolding in-character"
          },
          "if_learner_uses_native_language": {
            "strategy": "Redirect in {targetLanguage} only; encourage a response in {targetLanguage}. Do not reply in {nativeLanguage}.",
            "example": "Example response in {targetLanguage} that guides back to target language"
          },
          "if_learner_succeeds": {
            "strategy": "How to naturally escalate complexity",
            "example": "Example of adding complexity while staying in character"
          },
          "if_learner_is_silent": {
            "strategy": "How to re-engage without making it awkward",
            "example": "Example of natural re-engagement"
          }
        }
      },

      "target_chunks": {
        "primary": ["chunk_ids the learner SHOULD try to use (5-8)"],
        "bonus": ["additional chunks that would be impressive to use (3-5)"]
      },

      "conversation_flow": {
        "expected_phases": [
          {
            "phase": "opening",
            "description": "How the conversation typically starts",
            "ai_behavior": "What the AI does in this phase",
            "learner_goal": "What the learner should accomplish"
          },
          {
            "phase": "development",
            "description": "The core of the conversation",
            "ai_behavior": "How the AI pushes/challenges",
            "learner_goal": "The main task"
          },
          {
            "phase": "complication",
            "description": "An unexpected turn (B1+ only)",
            "ai_behavior": "How the AI introduces complexity",
            "learner_goal": "How to handle the curveball"
          },
          {
            "phase": "resolution",
            "description": "How the conversation wraps up",
            "ai_behavior": "Closing behavior",
            "learner_goal": "Clean exit"
          }
        ]
      },

      "hints": [
        {
          "trigger": "When to show this hint",
          "hint": "Helpful hint in {nativeLanguage} (NOT the answer, just a nudge)"
        }
      ],

      "example_successful_exchange": [
        {"speaker": "AI", "line": "opening line"},
        {"speaker": "Learner", "line": "example good response (natural, uses chunks)"},
        {"speaker": "AI", "line": "natural follow-up"},
        {"speaker": "Learner", "line": "continued good response"},
        {"speaker": "AI", "line": "introduces complication"},
        {"speaker": "Learner", "line": "handles it well"}
      ]
    }
  ]
}
```

**Scenario design rules:**
- **Response language:** The AI character must respond ONLY in {targetLanguage}. If the target language has formal/informal "you" (e.g. tú/usted, tu/vous, du/Sie), specify which form the AI uses (e.g. "tutear", "usted only") in the ai_character behavior_rules or register.
- **Corrections** should reflect common {nativeLanguage}→{targetLanguage} errors (e.g. false friends, word order, tense), not generic grammar.

| Level | Scenarios should... |
|-------|-------------------|
| A1 | Be simple, predictable, forgiving. AI is patient. Clear goal. |
| A2 | Introduce mild unpredictability. AI asks unexpected follow-ups. |
| B1 | Challenge opinions. AI disagrees, interrupts occasionally, asks "why?" |
| B2 | Require register awareness. AI switches formality. Professional pressure. |
| C1 | Test subtext comprehension. AI uses sarcasm, ambiguity, cultural references. |
| C2 | Full native pressure. AI shows impatience, uses dialect, tests code-switching. |

---

### 2. EVALUATION CRITERIA

For each scenario, define how performance is scored:

```json
{
  "evaluation": {
    "scoring_model": {
      "chunk_usage": {
        "weight": "{from level params}",
        "description": "Did the learner use target chunks naturally?",
        "scoring": {
          "excellent": "Used 80%+ of primary chunks naturally in context",
          "good": "Used 60-79% of primary chunks",
          "needs_work": "Used < 60% of primary chunks",
          "bonus": "Used bonus chunks: +5 points each"
        }
      },
      "fluency": {
        "weight": "{from level params}",
        "description": "Speech flow, pausing, filler management",
        "scoring": {
          "excellent": "Natural rhythm, appropriate pauses, controlled fillers",
          "good": "Minor hesitations, some unnatural pauses",
          "needs_work": "Frequent long pauses, excessive fillers, choppy rhythm"
        },
        "metrics": {
          "pause_threshold_ms": "Pauses > Xms count as hesitations (A1: 3000, A2: 2500, B1: 2000, B2: 1500, C1: 1000)",
          "filler_ratio_target": "Fillers per 100 words (A1: <15, A2: <12, B1: <10, B2: <8, C1: <5)",
          "speech_rate_target_wpm": "Words per minute target (A1: 60-80, A2: 80-100, B1: 100-120, B2: 120-140, C1: 140-160)"
        }
      },
      "task_completion": {
        "weight": "{from level params}",
        "description": "Did they achieve the conversational goal?",
        "scoring": {
          "excellent": "Goal fully achieved, conversation felt natural",
          "good": "Goal mostly achieved, some awkward moments",
          "needs_work": "Goal not achieved or conversation broke down"
        },
        "success_indicators": ["specific checkboxes for this scenario"]
      },
      "pronunciation": {
        "weight": "{from level params}",
        "description": "Connected speech, stress, intonation",
        "scoring": {
          "excellent": "Natural connected speech, appropriate stress and intonation",
          "good": "Some connected speech, minor stress issues",
          "needs_work": "Word-by-word pronunciation, flat intonation"
        },
        "focus_sounds": ["specific sounds to evaluate for {nativeLanguage} speakers in this module"]
      }
    },
    
    "feedback_output_model": {
      "overall_score": "0-100",
      "level_equivalent": "CEFR level this performance corresponds to",
      "strengths": ["2-3 specific things the learner did well"],
      "improvements": ["2-3 specific things to work on"],
      "chunk_report": {
        "used_naturally": ["chunks successfully used"],
        "used_awkwardly": ["chunks used but not naturally"],
        "missed_opportunities": ["moments where a chunk would have been perfect"]
      },
      "pronunciation_report": {
        "good_sounds": ["sounds produced well"],
        "problem_sounds": ["sounds that need work"],
        "connected_speech_score": "How well did they link words and use reductions?"
      },
      "reformulated_native_version": "How a native would have said what the learner was trying to say (for key moments)",
      "next_steps": "Specific recommendation for what to practice next"
    }
  }
}
```

---

### 3. FLUENCY GYM DRILLS

Connected to this module's theme, generate daily practice drills:

```json
{
  "fluency_gym": {
    "module_id": "{moduleId}",
    "estimated_time_minutes": 10,
    
    "speed_response": {
      "instruction": "Answer each question in under 3 seconds. Don't think — react!",
      "instruction_native": "Instruction in {nativeLanguage}",
      "prompts": [
        {
          "id": "sr_001",
          "prompt": "Rapid-fire question related to the module theme",
          "acceptable_responses": ["list of acceptable response patterns"],
          "time_limit_seconds": 3
        }
      ]
    },

    "reduction_training": {
      "instruction": "Listen and repeat. Transform the formal version into how natives say it.",
      "instruction_native": "Instruction in {nativeLanguage}",
      "pairs": [
        {
          "id": "rt_001",
          "formal": "The textbook version",
          "native": "How natives say it",
          "audio_guide": "Pronunciation guidance"
        }
      ]
    },

    "filler_control": {
      "instruction": "Speak for 30 seconds about the topic WITHOUT using 'um', 'uh', or long pauses.",
      "instruction_native": "Instruction in {nativeLanguage}",
      "prompts": [
        {
          "id": "fc_001",
          "topic": "Speaking topic related to the module",
          "duration_seconds": 30,
          "forbidden_fillers": ["um", "uh", "er", "like (as filler)"],
          "allowed_fillers": ["well", "so", "I mean", "you know"]
        }
      ]
    },

    "paraphrasing_challenge": {
      "instruction": "Say the same thing in a completely different way.",
      "instruction_native": "Instruction in {nativeLanguage}",
      "items": [
        {
          "id": "pc_001",
          "original": "The sentence to paraphrase",
          "acceptable_paraphrases": ["list of valid alternatives"],
          "key_constraint": "Must keep the same meaning and register"
        }
      ]
    },

    "shadowing_sprint": {
      "instruction": "Listen and speak at the same time, matching the rhythm exactly.",
      "instruction_native": "Instruction in {nativeLanguage}",
      "text": "A paragraph from the module's podcast script, with rhythm markers",
      "rhythm_markers": "|thought groups| marked like |this for| |shadowing practice|",
      "duration_seconds": 60,
      "source": "Reference to the podcast section this comes from"
    },

    "recovery_strategy": {
      "instruction": "You're stuck mid-sentence. Use these strategies to recover without switching to {nativeLanguage}.",
      "instruction_native": "Instruction in {nativeLanguage}",
      "scenarios": [
        {
          "id": "rs_001",
          "stuck_moment": "You forgot the word for...",
          "recovery_strategies": [
            "Describe it: 'You know, the thing you use to...'",
            "Approximate: 'It's like a...'",
            "Ask: 'How do you say... the thing that...?'",
            "Redirect: 'Anyway, what I mean is...'"
          ],
          "practice_prompt": "Try to describe X without using the word X"
        }
      ]
    },

    "intonation_mimicry": {
      "instruction": "Copy the exact melody of these sentences. Focus on the music, not just the words.",
      "instruction_native": "Instruction in {nativeLanguage}",
      "sentences": [
        {
          "id": "im_001",
          "sentence": "The sentence to mimic",
          "intonation_pattern": "↗rising ↘falling →flat (marked on key words)",
          "what_it_communicates": "What this intonation pattern means emotionally/socially",
          "contrast": "Same words, different intonation = different meaning"
        }
      ]
    }
  }
}
```

---

### 4. FIXATION EXERCISES

After the conversation, the learner sees **fixation exercises** to consolidate vocabulary and chunks from the scenarios. Generate exactly **5–8 exercises** in the format the app consumes. Use ONLY these types: `fill_blank`, `multiple_choice`, `reorder_sentence`, `match_expression`. Questions in `{targetLanguage}`, explanations in `{nativeLanguage}`.

```json
{
  "fixation_exercises": [
    {
      "question_number": 1,
      "type": "fill_blank | multiple_choice | reorder_sentence | match_expression",
      "question_text": "Question or prompt in {targetLanguage}",
      "options": null,
      "correct_answer": "Exact string the app will match (for fill_blank/reorder_sentence). For multiple_choice, the text of the correct option. For match_expression, e.g. \"A-1,B-2,C-3\".",
      "explanation_text": "Brief explanation in {nativeLanguage}"
    }
  ]
}
```

**Rules:**
- **fill_blank:** `question_text` contains a gap (e.g. "The phrase you need is: I _____ to the shop."). `options` = null. `correct_answer` = the missing word/phrase.
- **multiple_choice:** `question_text` = the question. `options` = array of 4 strings (one correct). `correct_answer` = the exact text of the correct option.
- **reorder_sentence:** `question_text` = instruction (e.g. "Put the words in order to say: I want to go."). `options` = array of words/phrases in correct order. `correct_answer` = same as options joined (e.g. "I want to go") or the canonical correct order string the app expects.
- **match_expression:** `question_text` = instruction. `options` = array of objects like `[{"situation": "At a café", "expression": "I'd like a coffee"}, ...]` (pairs to match). `correct_answer` = mapping string (e.g. "A-1,B-2,C-3") if the app expects it, or a single correct pair description — confirm with existing match_expression usage in the codebase.
- Base exercises on **target_chunks** and scenario situations from this module. They should feel like a natural follow-up to the conversation.

**Minimum:** 5 exercises. Mix at least 2 multiple_choice, 1–2 fill_blank, 1 reorder_sentence or match_expression.

---

### 5. ADAPTIVE METADATA

```json
{
  "adaptive_metadata": {
    "difficulty_band": "low | mid | high",
    
    "scenario_escalation": {
      "if_overall_score_above_85": {
        "action": "introduce_harder_scenario",
        "changes": ["add interruption", "add time pressure", "require register switch"]
      },
      "if_chunk_usage_above_90": {
        "action": "introduce_next_module_chunks",
        "preview_chunks": ["chunks from the next module to start integrating"]
      }
    },
    
    "scenario_simplification": {
      "if_overall_score_below_50": {
        "action": "simplify_scenario",
        "changes": ["remove complication phase", "make AI more patient", "reduce target chunks to top 5"]
      },
      "if_task_completion_below_40": {
        "action": "guided_practice",
        "changes": ["provide sentence starters", "add more hints", "show example exchange first"]
      }
    },
    
    "targeted_drills": {
      "if_pronunciation_below_60": {
        "action": "inject_phonetic_drills",
        "drill_type": "minimal_pair | isolation | shadowing",
        "target_sounds": ["specific sounds from evaluation"]
      },
      "if_fluency_below_60": {
        "action": "inject_fluency_gym_extra",
        "focus": ["speed_response", "filler_control"],
        "extra_time_minutes": 5
      }
    }
  }
}
```

---

## OUTPUT

Return a single JSON object:

```json
{
  "module_type": "speaking",
  "module_id": "{moduleId}",
  "cefr_level": "{cefrLevel}",
  "target_language": "{targetLanguage}",
  "native_language": "{nativeLanguage}",
  "generated_at": "ISO timestamp",
  "pass_1_reference": "{moduleId}-lesson",
  "pass_2_reference": "{moduleId}-reading",
  "pass_3_reference": "{moduleId}-podcast",
  "content": {
    // scenarios, evaluation, fluency_gym, fixation_exercises, adaptive_metadata
  }
}
```

---

## CRITICAL RULES

1. **Scenarios must create REAL communicative pressure.** Not "practice these phrases" — "accomplish this goal using language."
2. **The AI character is a CHARACTER, not a teacher.** No corrections mid-conversation. No "good job!" No "try again." The AI reacts like a real person.
3. **Each scenario tests a DIFFERENT aspect.** Don't create 5 variations of the same interaction. Vary: register, emotion, complexity, relationship, stakes.
4. **Evaluation must be specific and actionable.** "Needs improvement" is useless. "You said 'I want to going' — natives say 'I wanna go'" is useful.
5. **The feedback model must include reformulated native versions.** Showing the learner how a native would have said the same thing is the most powerful feedback tool.
6. **Fluency gym drills must be themed.** Generic "speak for 30 seconds about anything" = weak. "Explain why you chose this coffee shop in 30 seconds without saying 'um'" = strong.
7. **Recovery strategies are NOT optional.** Every learner will get stuck. Teaching them to recover IN the target language (not switch to L1) is a core skill.

---

## AI BEHAVIORAL CONSISTENCY RULES (For the Speaking AI)

The AI character in speaking scenarios must follow these rules to maintain realism:

### All Levels:
- Never say "Good job" or "Well done" or any teacher-like praise
- React to CONTENT, not to LANGUAGE. If the learner says something interesting, respond to it.
- If the learner makes an error but communication succeeds, continue the conversation naturally.

### B1+:
- Occasionally interrupt (start speaking before the learner finishes)
- Ask follow-up questions that require improvisation (not just the prepared scenario)
- Express mild disagreement or skepticism to test argumentation

### B2+:
- Show realistic impatience if the learner takes too long (sigh, "so anyway...")
- Use incomplete sentences ("Yeah but the thing is— you know what I mean?")
- Switch register mid-conversation if the situation calls for it

### C1+:
- Use sarcasm, irony, understatement
- Make cultural references the learner should catch
- Use ambiguous responses that require the learner to clarify or interpret

### C2:
- Full native behavior — no scaffolding, no patience adjustment
- Use dialect features if relevant to the target language variant
- Test code-switching ability if the learner's profile suggests multilingual context
