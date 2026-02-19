import type {
  CEFRLevel,
  LevelParams,
} from '@/features/content-generation/domain/types/generation-request.types';
import { LEVEL_PARAMS_PATH, loadPromptFile } from './prompt-loader';

const LEVEL_SECTIONS: Record<CEFRLevel, string> = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
};

/**
 * Extracts the JSON block for a given CEFR level from 01-LEVEL-PARAMS.md.
 */
export async function loadLevelParams(
  cefrLevel: CEFRLevel,
): Promise<LevelParams> {
  const content = await loadPromptFile(LEVEL_PARAMS_PATH);
  const levelKey = LEVEL_SECTIONS[cefrLevel];
  const pattern = new RegExp(
    `## ${levelKey}[^\\n]*\\n\\s*\`\`\`json\\s*\\n([\\s\\S]*?)\\n\`\`\`\\s*\\n`,
  );
  const match = pattern.exec(content);
  if (!match) {
    throw new Error(
      `Level params not found for ${cefrLevel} in ${LEVEL_PARAMS_PATH}`,
    );
  }
  const jsonStr = match[1].trim();
  return JSON.parse(jsonStr) as LevelParams;
}
