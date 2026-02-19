import type {
  CEFRLevel,
  ModuleMetadata,
} from '@/features/content-generation/domain/types/generation-request.types';
import { loadPromptFile, MODULE_LIST_PATH } from './prompt-loader';

const LEVEL_HEADING = /^## (A1|A2|B1|B2|C1|C2) —/;
/** Matches table data rows: | N | module-id | ... (skip header and separator rows). */
const TABLE_ROW = /^\|\s*\d+\s*\|/;

/**
 * Parses 06-MODULE-LIST.md and returns all modules or one by moduleId.
 */
export async function loadModuleList(): Promise<ModuleMetadata[]> {
  const content = await loadPromptFile(MODULE_LIST_PATH);
  const lines = content.split('\n');
  const modules: ModuleMetadata[] = [];
  let currentLevel: CEFRLevel = 'A1';

  for (const line of lines) {
    const levelMatch = LEVEL_HEADING.exec(line);
    if (levelMatch) {
      currentLevel = levelMatch[1] as CEFRLevel;
      continue;
    }
    if (TABLE_ROW.test(line)) {
      const cells = line.split('|').map((s) => s.trim());
      const moduleId = cells[2];
      const title = cells[3];
      if (moduleId && title) {
        modules.push({
          moduleId,
          title,
          situationalTheme: cells[4] ?? '',
          readingFormat: cells[5] ?? '',
          phase: cells[6],
          level: currentLevel,
        });
      }
    }
  }

  return modules;
}

export async function getModuleMetadata(
  moduleId: string,
): Promise<ModuleMetadata | null> {
  const list = await loadModuleList();
  return list.find((m) => m.moduleId === moduleId) ?? null;
}
