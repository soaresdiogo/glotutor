import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Safety timeout per command (ms). Only used if the process never exits (e.g. open handles). Normal case: generate-content exits after "Finished". */
const SAFETY_TIMEOUT_MS = 30 * 60 * 1000; // 30 min

/** If set, script will skip commands up to and including this 1-based index (resume after crash/stop). */
const RESUME_FROM_INDEX: number | null = null; // e.g. set to 5 to skip commands 1–5 and start at 6

/** If true and progress file exists, resume from last completed index. Set to false to always start from 1. */
const AUTO_RESUME_FROM_FILE = true;

const PROGRESS_FILE = join(process.cwd(), '.run-commands-batch-progress.json');

function getLastCompletedIndex(): number {
  if (RESUME_FROM_INDEX != null) return RESUME_FROM_INDEX;
  if (!AUTO_RESUME_FROM_FILE || !existsSync(PROGRESS_FILE)) return 0;
  try {
    const data = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
    const idx = data?.lastCompletedIndex;
    return typeof idx === 'number' && idx >= 0 ? idx : 0;
  } catch {
    return 0;
  }
}

const COMMANDS: string[] = [
  'npm run generate-content -- --module c2-stage-presence --level C2 --target fr-FR --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-local-flavor --level C2 --target es-ES --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-switch-it-up --level C2 --target es-ES --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-big-questions --level C2 --target es-ES --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-spin-doctor --level C2 --target es-ES --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-timing-is-everything --level C2 --target es-ES --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-tell-me-a-story --level C2 --target es-ES --native pt-BR --passes lesson',
  'npm run generate-content -- --module c2-thought-leader --level C2 --target es-ES --native pt-BR --passes lesson',
];

type Result = {
  index: number;
  command: string;
  ok: boolean;
  durationMs: number;
  tokensUsed: number;
};

const FINISHED_MARKER = 'Finished generating content';

function runOneCommand(cmd: string, n: number, total: number): Promise<Result> {
  return new Promise((resolve) => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[${n}/${total}] ${cmd}`);
    console.log('─'.repeat(60));
    const cmdStart = Date.now();
    let resolved = false;

    const child = spawn(cmd, {
      shell: true,
      cwd: process.cwd(),
      stdio: ['inherit', 'pipe', 'inherit'],
      // Force token logging so we can parse and sum usage per command (no need for .env)
      env: { ...process.env, LOG_TOKEN_USAGE: '1' },
    });

    let sawFinished = false;
    let tokensUsed = 0;
    let stdoutBuffer = '';
    const TOKEN_TOTAL_RE = /total[=:]?\s*(\d+)/i;

    const finishAndResolve = (ok: boolean, reason: string) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(safetyTimer);
      try {
        child.kill('SIGTERM');
      } catch {
        // ignore
      }
      const durationMs = Date.now() - cmdStart;
      if (!ok && reason) {
        console.error(
          `\n[run-commands-batch] Command ${n}: ${reason}. Continuing to the next one.`,
        );
      }
      resolve({ index: n, command: cmd, ok, durationMs, tokensUsed });
    };

    child.stdout?.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk);
      const text = chunk.toString();
      stdoutBuffer += text;
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.includes('[tokens]')) {
          const m = TOKEN_TOTAL_RE.exec(line);
          if (m) tokensUsed += Number.parseInt(m[1], 10);
        }
      }
      if (text.includes(FINISHED_MARKER)) {
        sawFinished = true;
        setTimeout(() => {
          if (!resolved) {
            try {
              child.kill('SIGTERM');
            } catch {
              // ignore
            }
          }
        }, 2000);
      }
    });

    child.on('close', (code, signal) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(safetyTimer);
      const ok = code === 0 || sawFinished;
      if (!ok) {
        console.error(
          `\n[run-commands-batch] Command ${n} exited with code ${code ?? signal}. Continuing to the next one.`,
        );
      }
      resolve({
        index: n,
        command: cmd,
        ok,
        durationMs: Date.now() - cmdStart,
        tokensUsed,
      });
    });

    const safetyTimer = setTimeout(() => {
      finishAndResolve(
        false,
        `safety timeout (${SAFETY_TIMEOUT_MS / 60000} min) — process did not exit.`,
      );
    }, SAFETY_TIMEOUT_MS);
  });
}

function writeProgress(n: number, cmd: string): void {
  try {
    writeFileSync(
      PROGRESS_FILE,
      JSON.stringify(
        {
          lastCompletedIndex: n,
          lastCommand: cmd,
          at: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  } catch {
    // ignore
  }
}

function printSummary(results: Result[], totalMs: number): void {
  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed ?? 0), 0);
  console.log('\n' + '═'.repeat(60));
  console.log('[run-commands-batch] Summary');
  console.log('═'.repeat(60));
  console.log(
    `Total: ${results.length} | OK: ${succeeded} | Failed: ${failed} | Total time: ${(totalMs / 1000).toFixed(1)}s`,
  );
  if (totalTokens > 0) {
    console.log(`Tokens used (this run): ${totalTokens.toLocaleString()}`);
  }
  if (failed > 0) {
    console.log('\nFailed commands:');
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`  [${r.index}] ${r.command}`);
    }
  }
  console.log('');
}

async function main() {
  const trimmed = COMMANDS.map((c) => c.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    console.log(
      'No commands in the COMMANDS array. Edit scripts/run-commands-batch.ts and add commands.',
    );
    process.exit(0);
    return;
  }

  const startIndex = getLastCompletedIndex();
  if (startIndex > 0) {
    console.log(
      `\n[run-commands-batch] Resuming from command ${startIndex + 1} (${startIndex} already done). Delete ${PROGRESS_FILE} to start from 1.\n`,
    );
  }
  console.log(
    `\n[run-commands-batch] Executing ${trimmed.length - startIndex} command(s) (${trimmed.length} total). Advances when "Finished generating content" is printed or process exits.\n`,
  );
  const start = Date.now();
  const results: Result[] = [];

  for (let i = startIndex; i < trimmed.length; i++) {
    const cmd = trimmed[i];
    const n = i + 1;
    const result = await runOneCommand(cmd, n, trimmed.length);
    results.push(result);
    if (result.tokensUsed > 0) {
      console.log(
        `[run-commands-batch] Command ${n} tokens: ${result.tokensUsed.toLocaleString()}`,
      );
    }
    writeProgress(n, cmd);
  }

  const totalMs = Date.now() - start;
  printSummary(results, totalMs);
  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed > 0 ? 1 : 0);
}

void main();
