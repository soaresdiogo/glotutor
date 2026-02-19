import * as fs from 'node:fs';
import * as path from 'node:path';

const PROMPTS_DIR = 'prompts';

/**
 * Resolves the prompts directory: either PROJECT_ROOT/prompts or env CONTENT_PROMPTS_PATH.
 */
export function getPromptsDir(): string {
  const fromEnv = process.env.CONTENT_PROMPTS_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const cwd = process.cwd();
  const inCwd = path.join(cwd, PROMPTS_DIR);
  if (fs.existsSync(inCwd)) return inCwd;
  return path.join(cwd, PROMPTS_DIR);
}

/**
 * Loads a prompt file from the prompts directory.
 * Path is relative to prompts dir: e.g. "base/00-BASE-SYSTEM.md", "passes/02-PASS-LESSON.md".
 */
export async function loadPromptFile(relativePath: string): Promise<string> {
  const dir = getPromptsDir();
  const fullPath = path.join(dir, relativePath);
  return fs.promises.readFile(fullPath, 'utf-8');
}

export const PASS_PROMPT_PATHS: Record<
  'lesson' | 'reading' | 'podcast' | 'speaking',
  string
> = {
  lesson: 'passes/02-PASS-LESSON.md',
  reading: 'passes/03-PASS-READING.md',
  podcast: 'passes/04-PASS-PODCAST.md',
  speaking: 'passes/05-PASS-SPEAKING.md',
};

export const BASE_SYSTEM_PATH = 'base/00-BASE-SYSTEM.md';
export const LEVEL_PARAMS_PATH = 'base/01-LEVEL-PARAMS.md';
export const MODULE_LIST_PATH = 'references/06-MODULE-LIST.md';
