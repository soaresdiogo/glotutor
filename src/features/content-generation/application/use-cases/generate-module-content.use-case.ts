import type { IContentGeneratorPort } from '@/features/content-generation/domain/ports/content-generator.interface';
import type { IModuleSpecResolver } from '@/features/content-generation/domain/ports/module-spec-resolver.interface';
import type {
  IPromptComposer,
  PreviousPassOutputs,
} from '@/features/content-generation/domain/ports/prompt-composer.interface';
import type {
  ContentPass,
  GenerationRequest,
  ModuleSpec,
} from '@/features/content-generation/domain/types/generation-request.types';
import {
  type ValidationResult,
  validateLessonOutput,
  validatePodcastOutput,
  validateReadingOutput,
  validateSpeakingOutput,
} from '@/features/content-generation/infrastructure/utils/content-validator';
import {
  extractPass1Context,
  extractPass2Context,
  extractPass3Context,
} from '@/features/content-generation/infrastructure/utils/context-extractor';
import { normalizeLessonOutput } from '@/features/content-generation/infrastructure/utils/lesson-output-normalizer';

const PASS_ORDER: ContentPass[] = ['lesson', 'reading', 'podcast', 'speaking'];

export interface GenerateModuleContentOutput {
  pass: ContentPass;
  raw: unknown;
  validation: ValidationResult;
  saved?: boolean;
}

export interface IGenerateModuleContentUseCase {
  execute(
    request: GenerationRequest,
    options?: {
      onProgress?: (message: string) => void;
      onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
      saveToDb?: boolean;
    },
  ): Promise<GenerateModuleContentOutput[]>;
}

export class GenerateModuleContentUseCase
  implements IGenerateModuleContentUseCase
{
  constructor(
    private readonly specResolver: IModuleSpecResolver,
    private readonly promptComposer: IPromptComposer,
    private readonly contentGenerator: IContentGeneratorPort,
    private readonly saveLesson: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly saveReading: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly savePodcast: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly saveSpeaking: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
  ) {}

  async execute(
    request: GenerationRequest,
    options?: {
      onProgress?: (message: string) => void;
      onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
      saveToDb?: boolean;
    },
  ): Promise<GenerateModuleContentOutput[]> {
    const orderedPasses = this.orderPasses(request.passesToRun);
    if (orderedPasses.length === 0) {
      return [];
    }

    options?.onProgress?.('Resolving module spec...');
    const moduleSpec = await this.specResolver.resolve(request);

    const results: GenerateModuleContentOutput[] = [];
    let previousOutputs: PreviousPassOutputs = {};
    let pass1Output: unknown = null;
    let pass2Output: unknown = null;
    let pass3Output: unknown = null;

    const MAX_RETRIES = 2;

    for (const pass of orderedPasses) {
      options?.onProgress?.(`Composing prompt for ${pass}...`);
      const composed = await this.promptComposer.compose(
        pass,
        moduleSpec,
        Object.keys(previousOutputs).length > 0 ? previousOutputs : undefined,
      );

      let parsed: unknown = null;
      let validation: ValidationResult = {
        passed: false,
        errors: ['Not attempted'],
        warnings: [],
      };
      let lastValidation: ValidationResult = validation;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          options?.onProgress?.(
            `Retry ${attempt}/${MAX_RETRIES} for ${pass}...`,
          );
        }

        // On retry, add validation errors so the LLM knows what to fix
        let currentComposed = composed;
        if (attempt > 0 && lastValidation.errors.length > 0) {
          const retryAddendum = `\n\n## RETRY — PREVIOUS ATTEMPT FAILED\nThe previous generation was rejected for these reasons:\n${lastValidation.errors.map((e) => `- ${e}`).join('\n')}\n\nPlease fix these issues in this attempt. Pay special attention to using the chunks listed above.`;
          currentComposed = {
            systemPrompt: composed.systemPrompt,
            userMessage: composed.userMessage + retryAddendum,
          };
        }

        options?.onProgress?.(
          `Calling LLM for ${pass} (attempt ${attempt + 1})...`,
        );
        const rawJson = await this.contentGenerator.generate(
          currentComposed,
          pass,
          pass === 'lesson' ? { cefrLevel: moduleSpec.cefrLevel } : undefined,
        );

        try {
          parsed = JSON.parse(rawJson) as unknown;
        } catch {
          options?.onProgress?.(
            `Invalid JSON from LLM for ${pass}, attempt ${attempt + 1}`,
          );
          if (attempt === MAX_RETRIES) {
            throw new Error(
              `Invalid JSON from LLM for pass ${pass} after ${MAX_RETRIES + 1} attempts`,
            );
          }
          continue;
        }

        if (pass === 'lesson') {
          parsed = normalizeLessonOutput(parsed);
        }

        validation = this.validatePass(pass, parsed, moduleSpec, {
          pass1Output,
          pass2Output,
          pass3Output,
        });
        lastValidation = validation;

        if (validation.passed) {
          break;
        }

        options?.onProgress?.(
          `Validation failed for ${pass} (attempt ${attempt + 1}): ${validation.errors.join('; ')}`,
        );

        if (attempt === MAX_RETRIES) {
          options?.onProgress?.(
            `WARNING: ${pass} failed validation after ${MAX_RETRIES + 1} attempts. Skipping save.`,
          );
        }
      }

      results.push({ pass, raw: parsed, validation });

      if (validation.warnings.length > 0) {
        options?.onProgress?.(
          `Warnings for ${pass}: ${validation.warnings.join('; ')}`,
        );
      }

      const shouldSave =
        options?.saveToDb !== false && !request.reviewMode && validation.passed;

      if (request.reviewMode && options?.onReview) {
        const approved = await options.onReview(pass, parsed);
        if (approved && validation.passed) {
          await this.savePass(pass, parsed, moduleSpec);
          const last = results.at(-1);
          if (last) last.saved = true;
        }
      } else if (shouldSave) {
        if (pass === 'podcast') {
          options?.onProgress?.('Generating podcast audio (TTS)...');
        }
        await this.savePass(pass, parsed, moduleSpec);
        const last = results.at(-1);
        if (last) last.saved = true;
      }

      if (validation.passed) {
        if (pass === 'lesson') pass1Output = parsed;
        else if (pass === 'reading') pass2Output = parsed;
        else if (pass === 'podcast') pass3Output = parsed;

        previousOutputs = this.buildPreviousOutputs(
          pass,
          previousOutputs,
          pass1Output,
          pass2Output,
          pass3Output,
        );

        const chunkCount =
          (previousOutputs.from_pass_1 as { chunks_taught?: unknown[] })
            ?.chunks_taught?.length ?? 0;
        options?.onProgress?.(
          `Context updated: ${chunkCount} chunks available for next pass`,
        );
      } else {
        options?.onProgress?.(
          `Skipping subsequent passes because ${pass} failed validation.`,
        );
        break;
      }
    }

    return results;
  }

  private orderPasses(passes: ContentPass[]): ContentPass[] {
    return PASS_ORDER.filter((p) => passes.includes(p));
  }

  private validatePass(
    pass: ContentPass,
    output: unknown,
    moduleSpec: ModuleSpec,
    context: {
      pass1Output: unknown;
      pass2Output: unknown;
      pass3Output: unknown;
    },
  ): ValidationResult {
    const out = output as { content?: Record<string, unknown> };
    switch (pass) {
      case 'lesson':
        return validateLessonOutput(out, moduleSpec);
      case 'reading':
        return validateReadingOutput(
          out,
          moduleSpec,
          (context.pass1Output as { content?: { chunks?: unknown[] } }) ?? {},
        );
      case 'podcast':
        return validatePodcastOutput(out, moduleSpec);
      case 'speaking':
        return validateSpeakingOutput(out, moduleSpec);
      default:
        return { passed: true, errors: [], warnings: [] };
    }
  }

  private buildPreviousOutputs(
    lastPass: ContentPass,
    current: PreviousPassOutputs,
    p1: unknown,
    p2: unknown,
    p3: unknown,
  ): PreviousPassOutputs {
    if (lastPass === 'lesson' && p1) {
      return extractPass1Context(
        p1 as Parameters<typeof extractPass1Context>[0],
      );
    }
    if (lastPass === 'reading' && p1 && p2) {
      return extractPass2Context(
        p2 as Parameters<typeof extractPass2Context>[0],
        p1 as Parameters<typeof extractPass2Context>[1],
      );
    }
    if (lastPass === 'podcast' && p1 && p2 && p3) {
      const c1 = extractPass1Context(
        p1 as Parameters<typeof extractPass1Context>[0],
      );
      const c2 = extractPass2Context(
        p2 as Parameters<typeof extractPass2Context>[0],
        p1 as Parameters<typeof extractPass2Context>[1],
      );
      return extractPass3Context(
        p3 as Parameters<typeof extractPass3Context>[0],
        c1,
        c2,
      );
    }
    return current;
  }

  private async savePass(
    pass: ContentPass,
    output: unknown,
    spec: ModuleSpec,
  ): Promise<void> {
    switch (pass) {
      case 'lesson':
        await this.saveLesson(output, spec);
        break;
      case 'reading':
        await this.saveReading(output, spec);
        break;
      case 'podcast':
        await this.savePodcast(output, spec);
        break;
      case 'speaking':
        await this.saveSpeaking(output, spec);
        break;
    }
  }
}
