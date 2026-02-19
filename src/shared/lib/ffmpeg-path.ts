/**
 * Path to the ffmpeg binary.
 * 1. If ffmpeg-static path exists and the file is present on disk → use it
 * 2. Otherwise try `which ffmpeg` to use system binary
 * 3. Final fallback: 'ffmpeg'
 */
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';

import ffmpegStatic from 'ffmpeg-static';

function resolveFfmpegPath(): string {
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  try {
    const path = execSync('which ffmpeg', { encoding: 'utf8' }).trim();
    if (path) return path;
  } catch {
    // which failed or returned nothing
  }
  return 'ffmpeg';
}

export const ffmpegPath: string = resolveFfmpegPath();
