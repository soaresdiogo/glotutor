# GloTutor — Content Generation Prompts Revision Report

This document summarizes the review of all content-generation prompts and related configuration (TTS, speaking AI) for language-specific pedagogy, regional variants, and CEFR alignment.

---

## 1. Prompts That Are Generic and Need Language-Specific Adaptation

| Prompt / File | Issue | Severity |
|---------------|--------|----------|
| **base/00-BASE-SYSTEM.md** | "Phrasal verb density", "Prefer phrasal verbs" — English-only. No language-specific grammar or pedagogy. | High |
| **base/01-LEVEL-PARAMS.md** | All `grammar_patterns` and `connected_speech` are English-centric (e.g. "Present perfect", "wanna/gonna", "Used to"). Single file for all target languages. | High |
| **passes/02-PASS-LESSON.md** | Chunk/grammar instructions are generic; no guidance for language-specific structures (e.g. German cases, French liaison, Spanish ser/estar). | High |
| **passes/03-PASS-READING.md** | Pronunciation section hardcodes "For **Portuguese** speakers learning **English**"; other L1/L2 pairs not addressed. | High |
| **passes/04-PASS-PODCAST.md** | Connected speech examples in English ("gonna", "gimme"); no accent/locale instruction for TTS or script. | Medium |
| **passes/05-PASS-SPEAKING.md** | Scenario and fluency drills are generic; no tutear/vosear, register, or L1-specific error handling per language. | Medium |
| **build-speaking-system-prompt.ts** | Correction example in English only; no explicit "respond ONLY in target language"; no regional variant (tú/vos/usted). | High |
| **openai-grammar.service.ts** | System prompt is language-agnostic ("grammar teacher"); no target language; tense names in English. | Medium |

---

## 2. Missing Points per Prompt

### 2.1 base/00-BASE-SYSTEM.md

- **Target language is not used to tailor pedagogy.** The prompt never says "adapt the following to the target language."
- **Phrasal verbs** are mentioned as universal; they are not (e.g. French, Portuguese do not have the same category).
- **Connected speech** list (reductions, linking) is English-oriented; other languages need their own (e.g. liaison/elision in French, separable verbs in German).
- **No regional variant** (e.g. pt-BR vs pt-PT, en-US vs en-GB, es-ES vs es-MX).
- **L1 interference** is generic; it does not list language-pair-specific errors (e.g. Portuguese→French false friends, English→German word order).

### 2.2 base/01-LEVEL-PARAMS.md

- **Grammar patterns** are only in English: "Present perfect (experiential only)", "Phrasal verbs", "Used to", "Going to". For Spanish/French/German/Italian/Portuguese as target, equivalent or different structures are not defined.
- **Connected speech** is English-specific: "wanna/gonna/gotta", "lemme/gimme". No equivalent guidance for other languages (e.g. French liaison, German sentence-final verb).
- **Single config for all languages** — no `target_language` or variant in the level params; the composer injects `targetLanguage` but the level file does not branch on it.

### 2.3 passes/02-PASS-LESSON.md

- **Chunk design** does not say "use formulaic language and structures that are natural in **targetLanguage**" (e.g. chunks in German may include case-marked phrases).
- **Grammar patterns** come from level params (English); no instruction to map or replace them when target is not English.
- **Common mistakes** ask for `{nativeLanguage}` speaker errors but do not require **target-language-specific** typical errors (e.g. ser/estar for Spanish, cases for German).
- **Connected speech map** examples are English; no mention of language-specific phenomena (liaison, mesóclise, separable verbs).

### 2.4 passes/03-PASS-READING.md

- **Pronunciation focus** explicitly says "For **Portuguese** speakers learning **English**" and lists /θ/, /ð/, etc. Other L1/L2 pairs are not mentioned.
- **Pronunciation points** should be parameterized: "for_native_speakers_of: {nativeLanguage}" and "challenge for {nativeLanguage} speakers learning {targetLanguage}".
- No instruction that **reading register and format** may vary by language (e.g. formal "you" in German/French/Spanish).

### 2.5 passes/04-PASS-PODCAST.md

- **Speaker accent** is optional ("accent: if relevant"); no requirement to specify **locale/variant** (e.g. pt-BR, en-GB, es-MX) so TTS or future multi-voice can use it.
- **Connected speech annotations** use English examples (gonna, gimme); no "adapt to target language".
- **TTS** is not instructed to produce locale-appropriate pronunciation; the pipeline also does not pass language to OpenAI TTS (see Section 5).

### 2.6 passes/05-PASS-SPEAKING.md

- **AI character** does not specify response language (e.g. "AI must respond only in {targetLanguage}").
- **Register/variant** (tú vs vos vs usted, tu vs vous) not specified per target language.
- **Correction** is not explicitly tied to **typical errors for {nativeLanguage} → {targetLanguage}** (e.g. Portuguese learners of French vs English learners of French).
- **Fluency gym** examples (fillers, recovery) are English-oriented; fillers and recovery phrases differ by language.

### 2.7 build-speaking-system-prompt.ts (Conversation AI)

- No explicit rule: **"You MUST respond only in {targetLanguage}. Never use the student's native language in your reply."**
- Correction example is English ("I go to restaurant yesterday" → "went"); no instruction to correct in the **target language** with explanations appropriate to that language.
- **Regional variant** (e.g. tutear vs vosear, pt-BR vs pt-PT) is not passed or instructed.
- **CEFR** is used for correction strictness but not for grammatical complexity of the model's responses (e.g. subjunctive only at B1+ for Spanish).

### 2.8 openai-grammar.service.ts (Reading grammar analysis)

- **Target language** is not passed; the model returns "tense name" and "structure" in English.
- No instruction to use **terminology natural to the target language** or to the learner's level in that language.

---

## 3. Suggested Corrections (with examples)

### 3.1 base/00-BASE-SYSTEM.md

**Add after "UNIVERSAL PARAMETERS":**

```markdown
### Target-Language-Specific Pedagogy

The **target language** (`{targetLanguage}`) determines which grammatical and phonological features are in scope. Do NOT transfer English-specific concepts to other languages.

- **English:** Present Perfect vs Simple Past, phrasal verbs, chunks and formulaic language are central; use the level's phrasal_verb_density and chunk instructions as given.
- **Portuguese:** No Present Perfect equivalent like English; use futuro do pretérito, mesóclise (pronoun placement) where relevant; distinguish pt-BR vs pt-PT if variant is specified.
- **Spanish:** Ser vs estar (different from Portuguese); subjuntivo in daily use; distinguish Spain (vosotros) vs Latin America (vos, ustedes); pretérito indefinido vs perfecto by region.
- **French:** Passé composé vs imparfait; liaison and elision; ne...pas negation; no "phrasal verbs" as in English; use formulaic language appropriate to French.
- **German:** Four cases (Nominativ, Akkusativ, Dativ, Genitiv); verb position (e.g. verb-final in subordinate clauses); separable verbs; three genders (der/die/das); Perfekt usage.
- **Italian:** Pro-drop, congiuntivo (subjunctive); regional pronunciation when relevant.

**Regional variant:** When the spec includes a regional variant (e.g. pt-BR, pt-PT, en-US, en-GB, es-ES, es-MX), all examples, chunks, and cultural notes must match that variant. Do not mix variants.
```

**Replace the "Naturalness Constraint" bullet that says "Prefer phrasal verbs":**

- **Before:** "Prefer phrasal verbs and colloquial forms over Latinate/formal equivalents when representing spoken language"
- **After:** "When target language is English: prefer phrasal verbs and colloquial forms over Latinate/formal equivalents when representing spoken language. When target language is not English: prefer the natural spoken structures of that language (e.g. fixed expressions, verb framing, or register-appropriate forms) — do not force English-style phrasal verbs."

**In the complexity table:** Add a note: "Phrasal verb density and idiomatic density apply as stated when target language is English; for other languages, use equivalent natural multi-word or formulaic density appropriate to that language."

---

### 3.2 passes/03-PASS-READING.md (Pronunciation)

**Replace the block "For Portuguese speakers learning English, prioritize:"** with:

```markdown
**Pronunciation focus must be specific to the pair {nativeLanguage} → {targetLanguage}:**

- For **Portuguese** speakers learning **English:** e.g. /θ/, /ð/, /ɹ/, final consonants, word stress.
- For **English** speakers learning **Spanish:** e.g. trilled /r/, /θ/ vs /s/ (Spain), vowel length, stress.
- For **Portuguese/Spanish** speakers learning **French:** liaison, elision, nasal vowels, silent endings.
- For **Portuguese/English** speakers learning **German:** umlauts, final devoicing, compound stress, rhythm.
- For any L1 learning **Italian:** double consonants, open/close e/o, regional variants if specified.

Always set `for_native_speakers_of` to `{nativeLanguage}` and explain WHY each sound or pattern is hard for that L1 when learning `{targetLanguage}`. Do not give generic tips.
```

---

### 3.3 build-speaking-system-prompt.ts (Conversation AI)

**Add at the top of the rules (after "You are a friendly... tutor"):**

```ts
// In the returned string, add:
`0. LANGUAGE: You MUST respond ONLY in ${params.targetLanguage}. Never use ${params.nativeLanguage} in your reply or in the "reply" field. Corrections and explanations may reference ${params.nativeLanguage} only when explaining meaning or contrast, but your main reply, next_question, and any example sentences must be in ${params.targetLanguage}.`;
```

**Add after the correction example:**

- "When correcting, use the correct form **in the target language** and explain briefly in a way appropriate for a ${params.cefrLevel} learner. If the target language has regional forms (e.g. tú vs vos, tu vs você), use the variant appropriate to the session (if specified)."

**Optional:** Pass `regionalVariant` (e.g. "pt-BR", "es-MX") from the topic into `BuildSystemPromptParams` and add: "Use the following regional variant in your responses: {regionalVariant}."

---

### 3.4 passes/02-PASS-LESSON.md

**Add under "Rules for chunks":**

- "Chunks must be natural **in the target language** (`{targetLanguage}`). For languages with cases (e.g. German), include case-marked forms where appropriate. For languages with strong register (e.g. tú/vos/usted in Spanish), specify register in the chunk metadata."

**Add under "COMMON {nativeLanguage} SPEAKER MISTAKES":**

- "Errors must be specific to **{nativeLanguage} → {targetLanguage}**. Include at least one structural error that is typical for this pair (e.g. ser/estar for Spanish, case for German, tense choice for French vs English)."

---

### 3.5 passes/04-PASS-PODCAST.md

**In episode metadata, make accent/locale explicit:**

- "For each speaker, set `accent` or `locale` to the intended variant (e.g. en-US, en-GB, pt-BR, es-MX) so that TTS or voice selection can match. Use one consistent variant per episode unless the scenario requires dialect contrast."

**In connected speech:**

- "Annotate connected speech and reductions **appropriate to the target language** (e.g. French liaison and elision, German separable verb stress, Spanish reductions). Do not only use English examples like 'gonna' when the script is in another language."

---

### 3.6 passes/05-PASS-SPEAKING.md

**In scenario "situation" or "ai_character":**

- "Specify the **response language**: AI must respond only in `{targetLanguage}`. If the target language has formal/informal 'you' (e.g. tú/usted, tu/vous, du/Sie), specify which form the AI character uses (e.g. 'tutear', 'usted only')."

**In reaction_guidelines:**

- "When the learner uses their native language, redirect in **{targetLanguage}** and encourage a response in {targetLanguage}. Corrections should reflect common **{nativeLanguage} → {targetLanguage}** errors (e.g. false friends, word order, tense) rather than generic grammar."

---

### 3.7 openai-grammar.service.ts

- Pass **target language** (e.g. from reading text metadata) into `analyze()` and into the system prompt.
- System prompt addition: "The text is in **{targetLanguage}**. Name structures in a way appropriate for that language (or in the learner's native language if preferred for explanations). Return the same JSON shape; keep explanations brief."

---

## 4. Level Params (01-LEVEL-PARAMS.md) — Language-Specific Handling

**Option A (recommended for now):** Keep a single file but add a **note at the top**:

```markdown
## Target-language adaptation

The grammar_patterns and connected_speech arrays below are described in English and are calibrated for **English as the target language**. When generating content for another target language (Portuguese, Spanish, French, German, Italian):

1. **Map or replace** grammar patterns with the closest equivalent in the target language (e.g. "Present perfect (experiential)" → French passé composé vs imparfait, or Spanish pretérito perfecto; "Phrasal verbs" → German separable verbs or French fixed "verb + preposition" expressions where applicable).
2. **Replace connected_speech** with phenomena that exist in the target language (e.g. French: liaison, elision; German: sentence rhythm, separable verb stress; Spanish: linking, weak pronouns; Portuguese: mesóclise, contractions).
3. **Do not** literally teach "Present perfect" or "wanna/gonna" when the target language is not English.
```

**Option B (future):** Introduce per-language level param overrides (e.g. `prompts/base/01-LEVEL-PARAMS-{lang}.md` or a JSON overlay per `targetLanguage`) and have the composer load the right set. This requires a small change in `level-params-parser.ts` and possibly in the module spec (e.g. `targetLanguage` or `languageCode`).

---

## 5. TTS / Audio Configuration and Native Pronunciation

**Criterion:** Audio for each language must sound like a **native speaker with standard, clear pronunciation**. A native speaker of the language should recognize the audio as natural. Avoid voices that sound non-native or overly robotic.

### Voice/model per language (Azure Neural — native voices)

| Language   | Default locale | Voice (primary)       | Voice (second speaker) | Notes                                              |
|-----------|----------------|------------------------|-------------------------|----------------------------------------------------|
| Portuguese| pt-BR          | pt-BR-FranciscaNeural | pt-BR-AntonioNeural     | Brazilian as standard                              |
| English   | en-US          | en-US-JennyNeural     | en-US-GuyNeural         | en-GB (Sonia/Ryan) and en-AU available             |
| Spanish   | es-MX          | es-MX-DaliaNeural     | es-MX-JorgeNeural       | Neutral Latin American; es-419 → es-MX             |
| French    | fr-FR          | fr-FR-DeniseNeural    | fr-FR-HenriNeural       | Nasals, liaison, guttural r                        |
| German    | de-DE          | de-DE-KatjaNeural     | de-DE-ConradNeural      | Umlauts, guttural ch, characteristic intonation    |
| Italian   | it-IT          | it-IT-ElsaNeural      | it-IT-DiegoNeural       | Melody and rhythm                                  |

All are **Azure Neural** voices trained on native speech for that locale, not generic voices with locale switched.

### 5.1 Speaking (Azure TTS) — `azure-text-to-speech.gateway.ts`

- **Current:** Locale and voice mapping live in `@/shared/lib/tts-azure-locales.ts`. Defaults: pt→pt-BR, en→en-US, **es→es-MX** (neutral Spanish), fr→fr-FR, de→de-DE, it→it-IT. Extended locales (en-GB, pt-PT, es-AR, fr-CA, de-AT, de-CH) are supported when `topic.languageCode` is a full locale.
- **Implemented:** Each locale uses a native Azure Neural voice; default Spanish is es-MX for neutral, natural pronunciation.

### 5.2 Podcast / Listening — `generate-podcast.factory.ts`, `azure-tts.gateway.ts`, `openai-tts.gateway.ts`

- **Current:** When **AZURE_SPEECH_KEY** and **AZURE_SPEECH_REGION** are set, the podcast use case uses **AzureListeningTTSGateway**, which respects `languageCode` and uses the same native Neural voices per locale (pt-BR, en-US, es-MX, fr-FR, de-DE, it-IT). Two-speaker podcasts use primary and second voice per locale from `tts-azure-locales.ts`.
- **Fallback:** When Azure is not configured, **OpenAITTSGateway** is used; it has **no language/locale parameter** (fixed voices nova/alloy), so non-English podcasts may not sound native. `TTSSynthesizeOptions.languageCode` is optional and ignored by OpenAI.
- **Recommendation:** Set Azure env vars in production so podcast TTS uses native pronunciation for all supported languages.

### 5.3 Reading (Azure) — `azure-speech-pronunciation.service.ts`

- **Current:** `toAzureLocale()` maps language code to a single locale (e.g. pt→pt-BR, es→es-ES). Sufficient for pronunciation assessment if the reading content is in that language.
- **Suggestion:** If you later support regional variants for reading (e.g. pt-PT), pass the full locale from the text/content and map it in `toAzureLocale` so assessment uses the same variant.

---

## 6. Checklist Summary (per prompt)

| Criterion | Base | Lesson | Reading | Podcast | Speaking | Conv. AI |
|----------|------|--------|---------|--------|----------|----------|
| Target language clearly specified | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pedagogy specific to that language | ❌→✅ (after edits) | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Regional variant when needed | ❌→✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CEFR level considered | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Examples natural for native speaker | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

After applying the suggested corrections, the "Pedagogy specific to that language" and "Regional variant" rows should be improved across the board; "Examples natural for native" is improved by the base-prompt language-specific section and by replacing hardcoded L1/L2 in the reading prompt.

---

## 7. Implementation Order

1. **High impact, prompt-only:** Base system (00) language-specific section and naturalness constraint; Reading (03) pronunciation L1/L2 parameterization; Speaking conversation (build-speaking-system-prompt) "respond only in target language" and correction language.
2. **Medium impact:** Lesson (02) and Speaking pass (05) explicit target-language and register/variant; Podcast (04) accent/locale and connected-speech per language.
3. **Code/config:** Level params note (01); TTS: extend Azure locale/voice map and document podcast TTS limitation; optionally add locale to `resolveTtsLanguage` and topic.
4. **Optional/future:** Per-language level param files or overlays; grammar service receiving target language; podcast TTS using an engine that supports locale.

All prompts and code comments should remain in **English** as per project rules.
