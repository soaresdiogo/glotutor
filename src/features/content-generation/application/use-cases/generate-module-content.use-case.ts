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
    if (orderedPasses.length === 0) return [];

    options?.onProgress?.('Resolving module spec...');
    const moduleSpec = await this.specResolver.resolve(request);

    const results: GenerateModuleContentOutput[] = [];
    let previousOutputs: PreviousPassOutputs = {};
    let pass1Output: unknown = null;
    let pass2Output: unknown = null;
    let pass3Output: unknown = null;

    for (const pass of orderedPasses) {
      const outcome = await this.runOnePass(
        pass,
        moduleSpec,
        previousOutputs,
        pass1Output,
        pass2Output,
        pass3Output,
        request,
        options,
      );
      results.push(outcome.result);
      pass1Output = outcome.pass1Output;
      pass2Output = outcome.pass2Output;
      pass3Output = outcome.pass3Output;
      previousOutputs = outcome.previousOutputs;

      if (!outcome.validationPassed) {
        options?.onProgress?.(
          `Skipping subsequent passes because ${pass} failed validation.`,
        );
        break;
      }
    }
    return results;
  }

  private async runOnePass(
    pass: ContentPass,
    moduleSpec: ModuleSpec,
    previousOutputs: PreviousPassOutputs,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
    request: GenerationRequest,
    options:
      | {
          onProgress?: (message: string) => void;
          onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
          saveToDb?: boolean;
        }
      | undefined,
  ): Promise<{
    result: GenerateModuleContentOutput;
    pass1Output: unknown;
    pass2Output: unknown;
    pass3Output: unknown;
    previousOutputs: PreviousPassOutputs;
    validationPassed: boolean;
  }> {
    options?.onProgress?.(`Composing prompt for ${pass}...`);
    const composed = await this.promptComposer.compose(
      pass,
      moduleSpec,
      Object.keys(previousOutputs).length > 0 ? previousOutputs : undefined,
    );

    const { parsed, validation } = await this.runGenerationWithRetries(
      pass,
      composed,
      moduleSpec,
      options,
      pass1Output,
      pass2Output,
      pass3Output,
    );

    const result: GenerateModuleContentOutput = {
      pass,
      raw: parsed,
      validation,
    };
    if (validation.warnings.length > 0) {
      options?.onProgress?.(
        `Warnings for ${pass}: ${validation.warnings.join('; ')}`,
      );
    }

    const {
      pass1Output: nextP1,
      pass2Output: nextP2,
      pass3Output: nextP3,
      previousOutputs: nextPrevious,
    } = await this.handleSaveAndContext(
      pass,
      parsed,
      validation,
      result,
      request,
      options,
      moduleSpec,
      pass1Output,
      pass2Output,
      pass3Output,
      previousOutputs,
    );

    return {
      result,
      pass1Output: nextP1,
      pass2Output: nextP2,
      pass3Output: nextP3,
      previousOutputs: nextPrevious,
      validationPassed: validation.passed,
    };
  }

  private static readonly MAX_RETRIES = 2;

  private async runOneGenerationAttempt(
    pass: ContentPass,
    currentComposed: Awaited<ReturnType<IPromptComposer['compose']>>,
    moduleSpec: ModuleSpec,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
  ): Promise<{ parsed: unknown; validation: ValidationResult } | null> {
    const rawJson = await this.contentGenerator.generate(
      currentComposed,
      pass,
      pass === 'lesson' ? { cefrLevel: moduleSpec.cefrLevel } : undefined,
    );
    const parseResult = this.parseJsonOrNull(rawJson);
    if (parseResult === null) return null;
    const parsed =
      pass === 'lesson' ? normalizeLessonOutput(parseResult) : parseResult;
    const validation = this.validatePass(pass, parsed, moduleSpec, {
      pass1Output,
      pass2Output,
      pass3Output,
    });
    return { parsed, validation };
  }

  private async runGenerationWithRetries(
    pass: ContentPass,
    composed: Awaited<ReturnType<IPromptComposer['compose']>>,
    moduleSpec: ModuleSpec,
    options: { onProgress?: (message: string) => void } | undefined,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
  ): Promise<{ parsed: unknown; validation: ValidationResult }> {
    let parsed: unknown = null;
    let validation: ValidationResult = {
      passed: false,
      errors: ['Not attempted'],
      warnings: [],
    };
    let lastValidation: ValidationResult = validation;
    const MAX_RETRIES = GenerateModuleContentUseCase.MAX_RETRIES;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        options?.onProgress?.(`Retry ${attempt}/${MAX_RETRIES} for ${pass}...`);
      }
      const currentComposed = this.buildComposedForAttempt(
        composed,
        attempt,
        lastValidation,
      );
      options?.onProgress?.(
        `Calling LLM for ${pass} (attempt ${attempt + 1})...`,
      );
      const result = await this.runOneGenerationAttempt(
        pass,
        currentComposed,
        moduleSpec,
        pass1Output,
        pass2Output,
        pass3Output,
      );

      if (result === null) {
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
      parsed = result.parsed;
      validation = result.validation;
      lastValidation = validation;
      if (validation.passed) break;

      options?.onProgress?.(
        `Validation failed for ${pass} (attempt ${attempt + 1}): ${validation.errors.join('; ')}`,
      );
      if (attempt === MAX_RETRIES) {
        options?.onProgress?.(
          `WARNING: ${pass} failed validation after ${MAX_RETRIES + 1} attempts. Skipping save.`,
        );
      }
    }
    return { parsed: parsed ?? {}, validation };
  }

  private buildComposedForAttempt(
    composed: Awaited<ReturnType<IPromptComposer['compose']>>,
    attempt: number,
    lastValidation: ValidationResult,
  ): Awaited<ReturnType<IPromptComposer['compose']>> {
    if (attempt === 0 || lastValidation.errors.length === 0) return composed;
    const retryAddendum = `\n\n## RETRY — PREVIOUS ATTEMPT FAILED\nThe previous generation was rejected for these reasons:\n${lastValidation.errors.map((e) => `- ${e}`).join('\n')}\n\nPlease fix these issues in this attempt. Pay special attention to using the chunks listed above.`;
    return {
      systemPrompt: composed.systemPrompt,
      userMessage: composed.userMessage + retryAddendum,
    };
  }

  private parseJsonOrNull(raw: string): unknown | null {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  private async handleSaveAndContext(
    pass: ContentPass,
    parsed: unknown,
    validation: ValidationResult,
    result: GenerateModuleContentOutput,
    request: GenerationRequest,
    options:
      | {
          onProgress?: (message: string) => void;
          onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
          saveToDb?: boolean;
        }
      | undefined,
    moduleSpec: ModuleSpec,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
    previousOutputs: PreviousPassOutputs,
  ): Promise<{
    pass1Output: unknown;
    pass2Output: unknown;
    pass3Output: unknown;
    previousOutputs: PreviousPassOutputs;
  }> {
    const shouldSave =
      options?.saveToDb !== false && !request.reviewMode && validation.passed;

    if (request.reviewMode && options?.onReview) {
      const approved = await options.onReview(pass, parsed);
      if (approved && validation.passed) {
        await this.savePass(pass, parsed, moduleSpec);
        result.saved = true;
      }
    } else if (shouldSave) {
      if (pass === 'podcast') {
        options?.onProgress?.('Generating podcast audio (TTS)...');
      }
      await this.savePass(pass, parsed, moduleSpec);
      result.saved = true;
    }

    let nextP1 = pass1Output;
    let nextP2 = pass2Output;
    let nextP3 = pass3Output;
    let nextPrevious = previousOutputs;

    if (validation.passed) {
      if (pass === 'lesson') nextP1 = parsed;
      else if (pass === 'reading') nextP2 = parsed;
      else if (pass === 'podcast') nextP3 = parsed;
      nextPrevious = this.buildPreviousOutputs(
        pass,
        previousOutputs,
        nextP1,
        nextP2,
        nextP3,
      );
      const chunkCount =
        (nextPrevious.from_pass_1 as { chunks_taught?: unknown[] })
          ?.chunks_taught?.length ?? 0;
      options?.onProgress?.(
        `Context updated: ${chunkCount} chunks available for next pass`,
      );
    }

    return {
      pass1Output: nextP1,
      pass2Output: nextP2,
      pass3Output: nextP3,
      previousOutputs: nextPrevious,
    };
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
