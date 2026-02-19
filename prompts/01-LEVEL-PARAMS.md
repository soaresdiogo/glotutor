# LEVEL PARAMETERS — CEFR Configuration Reference

> This file defines all level-specific parameters. The script loads the appropriate
> config based on the module's CEFR level and injects it into the generation prompts.

---

## A1 — Social Survival System

```json
{
  "level": "A1",
  "label": "Social Survival System",
  "cognitive_goal": "Break mental translation — create automatic reactions",
  "identity_goal": "Feel capable of surviving basic social interactions without L1",
  
  "content_params": {
    "chunk_count": { "min": 15, "max": 20 },
    "dialogue_complexity": "basic",
    "max_sentence_length": 8,
    "clause_complexity": "simple",
    "lexical_band": "top_500",
    "phrasal_verb_density": "1-2 per dialogue",
    "idiomatic_density": "0-1 per text",
    "filler_frequency": "rare, modeled explicitly",
    "self_correction": "none"
  },

  "grammar_patterns": [
    "I'm + verb-ing",
    "I wanna / I gotta",
    "Can I…?",
    "Do you…?",
    "I don't really…",
    "It's kinda…",
    "There's / There are",
    "Past simple (high-frequency verbs only)",
    "Question patterns (no terminology)"
  ],

  "connected_speech": [
    "wanna / gonna / gotta",
    "lemme / gimme",
    "linking consonant-vowel",
    "schwa introduction",
    "word stress basics"
  ],

  "reading": {
    "formats": ["whatsapp_chat", "instagram_caption", "menu", "simple_review", "micro_story"],
    "word_count": { "min": 100, "max": 300 }
  },

  "listening": {
    "format": "micro_episode",
    "duration_minutes": { "min": 2, "max": 3 },
    "speakers": "1-2",
    "speech_rate": "clear, slightly slower than native",
    "styles": ["day_in_the_life", "two_friends_chatting"]
  },

  "speaking": {
    "duration_seconds": 30,
    "types": ["survival_response", "simple_roleplay", "reaction_speed_round", "filler_control"],
    "ai_behavior": "patient, encouraging, repeats if needed, never corrects mid-conversation"
  },

  "exercises": {
    "types": ["chunk_recognition", "gap_fill", "reorder", "match_situation", "speed_response"],
    "variation_count": { "min": 3, "max": 5 }
  },

  "adaptive_thresholds": {
    "escalate_if_score_above": 85,
    "simplify_if_score_below": 50,
    "pronunciation_drill_if_below": 60,
    "chunk_reinforcement_if_usage_below": 40
  },

  "fluency_score_weights": {
    "chunk_usage": 0.30,
    "task_completion": 0.30,
    "pronunciation_clarity": 0.25,
    "speech_flow": 0.15
  }
}
```

---

## A2 — Conversational Builder

```json
{
  "level": "A2",
  "label": "Conversational Builder",
  "cognitive_goal": "Sustain 5-10 minute conversations naturally",
  "identity_goal": "Feel like someone who can actually have a conversation, not just survive",

  "content_params": {
    "chunk_count": { "min": 20, "max": 25 },
    "dialogue_complexity": "intermediate",
    "max_sentence_length": 12,
    "clause_complexity": "simple + coordinated",
    "lexical_band": "top_1000",
    "phrasal_verb_density": "3-5 per dialogue",
    "idiomatic_density": "1-3 per text",
    "filler_frequency": "occasional, natural",
    "self_correction": "rare"
  },

  "grammar_patterns": [
    "Used to",
    "Going to",
    "Comparatives",
    "Because / So / Actually",
    "I feel like…",
    "I've been…",
    "Present perfect (experiential only)"
  ],

  "connected_speech": [
    "all A1 features",
    "weak forms (to, for, of, and)",
    "rhythm patterns (stress-timed awareness)",
    "thought groups"
  ],

  "reading": {
    "formats": ["reddit_post", "text_message_thread", "blog_mini", "event_invitation", "review_comment"],
    "word_count": { "min": 200, "max": 500 }
  },

  "listening": {
    "format": "short_episode",
    "duration_minutes": { "min": 3, "max": 5 },
    "speakers": "2",
    "speech_rate": "natural with some hesitation",
    "styles": ["gossip_conversation", "friends_planning", "casual_argument", "voice_note_style"]
  },

  "speaking": {
    "duration_seconds": 60,
    "types": ["story_retelling", "plan_negotiation", "soft_disagreement", "opinion_speed_challenge"],
    "ai_behavior": "friendly but introduces mild unpredictability, asks unexpected follow-ups"
  },

  "exercises": {
    "types": ["story_retelling", "opinion_express", "soft_disagreement", "plan_negotiation", "chunk_in_context"],
    "variation_count": { "min": 4, "max": 6 }
  },

  "adaptive_thresholds": {
    "escalate_if_score_above": 85,
    "simplify_if_score_below": 50,
    "pronunciation_drill_if_below": 60,
    "chunk_reinforcement_if_usage_below": 40
  },

  "fluency_score_weights": {
    "chunk_usage": 0.25,
    "task_completion": 0.25,
    "pronunciation_clarity": 0.25,
    "speech_flow": 0.25
  }
}
```

---

## B1 — Identity & Opinion

```json
{
  "level": "B1",
  "label": "Identity & Opinion",
  "cognitive_goal": "Build linguistic personality — express who you are",
  "identity_goal": "Feel like you have a voice in the target language, not just survival phrases",

  "content_params": {
    "chunk_count": { "min": 25, "max": 30 },
    "dialogue_complexity": "advanced",
    "max_sentence_length": 18,
    "clause_complexity": "subordinated",
    "lexical_band": "top_2000",
    "phrasal_verb_density": "5-8 per dialogue",
    "idiomatic_density": "3-5 per text",
    "filler_frequency": "natural",
    "self_correction": "occasional"
  },

  "grammar_patterns": [
    "Phrasal verbs (contextual clusters)",
    "Conditionals (real-life usage, not 1st/2nd/3rd)",
    "Modals for advice & obligation (should, could, might, gotta)",
    "Passive voice (functional, not formal)",
    "Relative clauses (natural spoken use)"
  ],

  "connected_speech": [
    "all A2 features",
    "intonation patterns for opinions and emotions",
    "emphasis for meaning contrast",
    "contrastive stress"
  ],

  "reading": {
    "formats": ["opinion_article", "news_summary", "email_thread", "slack_conversation", "travel_blog"],
    "word_count": { "min": 400, "max": 800 }
  },

  "listening": {
    "format": "discussion",
    "duration_minutes": { "min": 5, "max": 8 },
    "speakers": "2",
    "speech_rate": "natural pace with overlap markers",
    "styles": ["podcast_discussion", "workplace_meeting", "phone_complaint", "airport_issue"]
  },

  "speaking": {
    "duration_seconds": 120,
    "types": ["opinion_monologue", "debate_simulation", "conflict_resolution", "conversation_recovery"],
    "ai_behavior": "challenges opinions, introduces mild disagreement, occasionally interrupts, asks 'why?'"
  },

  "exercises": {
    "types": ["opinion_monologue", "debate_sim", "conflict_resolution", "conversation_recovery", "phrasal_verb_context"],
    "variation_count": { "min": 5, "max": 7 }
  },

  "adaptive_thresholds": {
    "escalate_if_score_above": 85,
    "simplify_if_score_below": 45,
    "pronunciation_drill_if_below": 55,
    "chunk_reinforcement_if_usage_below": 35
  },

  "fluency_score_weights": {
    "chunk_usage": 0.20,
    "task_completion": 0.25,
    "pronunciation_clarity": 0.25,
    "speech_flow": 0.30
  }
}
```

---

## B2 — Social Intelligence

```json
{
  "level": "B2",
  "label": "Social Intelligence",
  "cognitive_goal": "Sound sophisticated and educated in any social context",
  "identity_goal": "Feel like a competent professional who happens to speak another language",

  "content_params": {
    "chunk_count": { "min": 25, "max": 35 },
    "dialogue_complexity": "native-speed",
    "max_sentence_length": 25,
    "clause_complexity": "multi-clause",
    "lexical_band": "top_3000",
    "phrasal_verb_density": "8-12 per dialogue",
    "idiomatic_density": "5-8 per text",
    "filler_frequency": "native rate",
    "self_correction": "natural, strategic"
  },

  "grammar_patterns": [
    "Hedging language (I'd say, it seems like, arguably)",
    "Advanced modals (could have, might have been, would have)",
    "Reported speech (natural, not 'he said that he…')",
    "Nominalization (the impact of, the decision to)",
    "Complex connectors (having said that, that being said, nonetheless)"
  ],

  "connected_speech": [
    "all B1 features",
    "hedging intonation (softening through melody)",
    "rhetorical pauses for emphasis",
    "emphasis variation for persuasion"
  ],

  "reading": {
    "formats": ["linkedin_post", "opinion_editorial", "professional_email", "case_study", "corporate_announcement"],
    "word_count": { "min": 600, "max": 1200 }
  },

  "listening": {
    "format": "professional_podcast",
    "duration_minutes": { "min": 8, "max": 12 },
    "speakers": "2-3",
    "speech_rate": "full native speed",
    "styles": ["business_podcast", "debate_panel", "academic_mini_lecture", "high_speed_group"]
  },

  "speaking": {
    "duration_seconds": 180,
    "types": ["persuasive_talk", "meeting_simulation", "crisis_management", "register_switching"],
    "ai_behavior": "professional but unpredictable, pushes back on weak arguments, switches register unexpectedly, uses incomplete sentences"
  },

  "exercises": {
    "types": ["persuasive_talk", "meeting_sim", "crisis_management", "register_switching", "hedging_practice"],
    "variation_count": { "min": 6, "max": 8 }
  },

  "adaptive_thresholds": {
    "escalate_if_score_above": 85,
    "simplify_if_score_below": 45,
    "pronunciation_drill_if_below": 55,
    "chunk_reinforcement_if_usage_below": 35
  },

  "fluency_score_weights": {
    "chunk_usage": 0.15,
    "task_completion": 0.25,
    "pronunciation_clarity": 0.25,
    "speech_flow": 0.35
  }
}
```

---

## C1 — Subtext & Culture

```json
{
  "level": "C1",
  "label": "Subtext & Culture",
  "cognitive_goal": "Understand the unsaid — read between the lines",
  "identity_goal": "Feel like an insider who gets the culture, not just the language",

  "content_params": {
    "chunk_count": { "min": 30, "max": 40 },
    "dialogue_complexity": "native-speed",
    "max_sentence_length": "unlimited",
    "clause_complexity": "nested",
    "lexical_band": "top_5000+",
    "phrasal_verb_density": "high (native density)",
    "idiomatic_density": "8-12 per text",
    "filler_frequency": "native rate",
    "self_correction": "natural, strategic"
  },

  "grammar_patterns": [
    "Inversions (Not only did he…, Rarely do we…)",
    "Ellipsis (natural omission in conversation)",
    "Advanced discourse markers (mind you, for what it's worth, if anything)",
    "Metaphor (conceptual and cultural)",
    "Idiomatic density (native-level clustering)"
  ],

  "connected_speech": [
    "all B2 features",
    "sarcasm intonation (meaning reversal through tone)",
    "understatement tone",
    "regional features (when relevant to target language variant)"
  ],

  "reading": {
    "formats": ["opinion_essay", "literary_excerpt", "satirical_article", "cultural_commentary", "academic_summary"],
    "word_count": { "min": 800, "max": 1500 }
  },

  "listening": {
    "format": "cultural_analytical",
    "duration_minutes": { "min": 10, "max": 15 },
    "speakers": "2-3",
    "speech_rate": "full native speed with humor/sarcasm",
    "styles": ["comedy_clip_analysis", "fast_debate", "cultural_podcast", "regional_accent_exposure"]
  },

  "speaking": {
    "duration_seconds": 300,
    "types": ["sarcasm_practice", "irony_control", "storytelling_5min", "abstract_discussion"],
    "ai_behavior": "uses sarcasm, cultural references, tests if learner catches subtext, withholds agreement, uses ambiguous responses"
  },

  "exercises": {
    "types": ["sarcasm_detection", "irony_production", "storytelling", "abstract_discussion", "tone_identification"],
    "variation_count": { "min": 7, "max": 10 }
  },

  "adaptive_thresholds": {
    "escalate_if_score_above": 90,
    "simplify_if_score_below": 50,
    "pronunciation_drill_if_below": 50,
    "chunk_reinforcement_if_usage_below": 30
  },

  "fluency_score_weights": {
    "chunk_usage": 0.10,
    "task_completion": 0.20,
    "pronunciation_clarity": 0.25,
    "speech_flow": 0.45
  }
}
```

---

## C2 — Cognitive Flexibility

```json
{
  "level": "C2",
  "label": "Cognitive Flexibility",
  "cognitive_goal": "Total control — manipulate language consciously for any effect",
  "identity_goal": "Feel indistinguishable from a highly articulate native speaker",

  "content_params": {
    "chunk_count": { "min": 35, "max": 50 },
    "dialogue_complexity": "native-speed",
    "max_sentence_length": "unlimited",
    "clause_complexity": "unrestricted",
    "lexical_band": "unrestricted",
    "phrasal_verb_density": "native density",
    "idiomatic_density": "native density",
    "filler_frequency": "native rate, strategic use",
    "self_correction": "strategic (used for rhetorical effect)"
  },

  "grammar_patterns": [
    "All previous patterns at mastery level",
    "Stylistic inversion for rhetorical effect",
    "Register manipulation within same conversation",
    "Code-switching markers and mechanics",
    "Prosodic manipulation for persuasion"
  ],

  "connected_speech": [
    "all C1 features",
    "dialect features (recognition + production)",
    "code-switching markers",
    "prosodic manipulation (emphasis, pace, rhythm for effect)"
  ],

  "reading": {
    "formats": ["research_abstract", "editorial_critique", "legal_language_sample", "advanced_literature_analysis"],
    "word_count": { "min": 1000, "max": 2000 }
  },

  "listening": {
    "format": "long_form_panel",
    "duration_minutes": { "min": 15, "max": 20 },
    "speakers": "3+",
    "speech_rate": "unrestricted, dialect variation",
    "styles": ["TED_style_talk", "political_speech", "academic_panel", "regional_dialect_comparison"]
  },

  "speaking": {
    "duration_seconds": 600,
    "types": ["full_speech", "live_qa_simulation", "panel_debate", "accent_imitation"],
    "ai_behavior": "fully native-like, challenges at every level, uses dialect, tests code-switching ability, no scaffolding"
  },

  "exercises": {
    "types": ["speech_delivery", "live_qa", "panel_debate", "accent_imitation", "register_analysis"],
    "variation_count": { "min": 8, "max": 12 }
  },

  "adaptive_thresholds": {
    "escalate_if_score_above": 95,
    "simplify_if_score_below": 55,
    "pronunciation_drill_if_below": 50,
    "chunk_reinforcement_if_usage_below": 25
  },

  "fluency_score_weights": {
    "chunk_usage": 0.05,
    "task_completion": 0.20,
    "pronunciation_clarity": 0.25,
    "speech_flow": 0.50
  }
}
```
