import { GoogleGenAI } from '@google/genai';
import type { IContentGeneratorPort } from '@/features/content-generation/domain/ports/content-generator.interface';
import type {
  ComposedPrompt,
  ContentPass,
} from '@/features/content-generation/domain/types/generation-request.types';
import {
  buildLessonSubPassB1Instruction,
  buildLessonSubPassB2Instruction,
  LESSON_SUB_PASS_A_INSTRUCTION,
} from './lesson-sub-pass-instructions';

const MAX_OUTPUT_TOKENS = 16384;
/** Cap at 16384 for compatibility with models that limit completion tokens (e.g. gpt-4o-mini). */
const MAX_OUTPUT_TOKENS_PART_A = 16384;
const MAX_OUTPUT_TOKENS_PART_B1_B2 = 16384;
const MAX_OUTPUT_TOKENS_LESSON_PATCH = 8192;

/**
 * Content generator using Google Gemini API.
 * Same interface as LLMContentGenerator; provider and model are set via env.
 * Lesson uses A + B1 + B2 sub-passes; when isLessonPatch is true uses single completion.
 */
export class GeminiContentGenerator implements IContentGeneratorPort {
  private readonly ai: GoogleGenAI;

  constructor(
    apiKey: string,
    private readonly model: string = process.env.CONTENT_GENERATION_MODEL ??
      'gemini-2.5-flash',
  ) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(
    prompt: ComposedPrompt,
    pass: ContentPass,
    options?: {
      cefrLevel?: string;
      isLessonPatch?: boolean;
      targetLanguage?: string;
      nativeLanguage?: string;
    },
  ): Promise<string> {
    if (pass === 'lesson' && options?.isLessonPatch === true) {
      return this.generateSingle(prompt, pass, MAX_OUTPUT_TOKENS_LESSON_PATCH);
    }
    if (pass === 'lesson') {
      return this.generateLesson(prompt, options?.cefrLevel, {
        targetLanguage: options?.targetLanguage,
        nativeLanguage: options?.nativeLanguage,
      });
    }
    return this.generateSingle(prompt, pass, MAX_OUTPUT_TOKENS);
  }

  private async generateSingle(
    prompt: ComposedPrompt,
    pass: ContentPass,
    maxOutputTokens: number = MAX_OUTPUT_TOKENS,
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt.userMessage,
      config: {
        systemInstruction: prompt.systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens,
      },
    });

    if (process.env.LOG_TOKEN_USAGE === '1' && response.usageMetadata) {
      const u = response.usageMetadata;
      console.log(
        `[tokens] ${pass}: prompt=${u.promptTokenCount ?? 0} completion=${u.candidatesTokenCount ?? 0} total=${u.totalTokenCount ?? 0}`,
      );
    }

    const raw = response.text;
    if (!raw) throw new Error('Empty Gemini response');
    return raw;
  }

  private async runLessonSubPass(
    label: string,
    composed: ComposedPrompt,
    userMessage: string,
    maxOutputTokens: number,
  ): Promise<Record<string, unknown>> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: userMessage,
      config: {
        systemInstruction: composed.systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens,
      },
    });
    if (process.env.LOG_TOKEN_USAGE === '1' && response.usageMetadata) {
      const u = response.usageMetadata;
      console.log(
        `[tokens] ${label}: prompt=${u.promptTokenCount ?? 0} completion=${u.candidatesTokenCount ?? 0} total=${u.totalTokenCount ?? 0}`,
      );
    }
    const raw = response.text;
    if (!raw)
      throw new Error(`Empty Gemini response for lesson sub-pass ${label}`);
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error(`Invalid JSON from Gemini for lesson sub-pass ${label}`);
    }
  }

  private async generateLesson(
    composed: ComposedPrompt,
    cefrLevel?: string,
    subPassOptions?: { targetLanguage?: string; nativeLanguage?: string },
  ): Promise<string> {
    const userA = `${composed.userMessage}\n\n${LESSON_SUB_PASS_A_INSTRUCTION}`;
    const partA = await this.runLessonSubPass(
      'lesson-part-a',
      composed,
      userA,
      MAX_OUTPUT_TOKENS_PART_A,
    );

    const subPassB1Instruction = buildLessonSubPassB1Instruction(
      partA,
      cefrLevel,
      subPassOptions,
    );
    const userB1 = `${composed.userMessage}\n\n${subPassB1Instruction}`;
    const partB1 = await this.runLessonSubPass(
      'lesson-part-b1',
      composed,
      userB1,
      MAX_OUTPUT_TOKENS_PART_B1_B2,
    );

    const subPassB2Instruction = buildLessonSubPassB2Instruction(
      partA,
      partB1,
      cefrLevel,
      subPassOptions,
    );
    const userB2 = `${composed.userMessage}\n\n${subPassB2Instruction}`;
    const partB2 = await this.runLessonSubPass(
      'lesson-part-b2',
      composed,
      userB2,
      MAX_OUTPUT_TOKENS_PART_B1_B2,
    );

    const merged = {
      module_type: 'lesson',
      content: { ...partA, ...partB1, ...partB2 },
    };
    return JSON.stringify(merged);
  }
}
