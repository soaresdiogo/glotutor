import type { NextRequest } from 'next/server';

import { generatePodcastSchema } from '@/features/listening/application/dto/generate-podcast.dto';
import { makeGeneratePodcastUseCase } from '@/features/listening/application/factories/generate-podcast.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getListeningAuthUser } from '../get-auth-user';

/**
 * @deprecated Podcast generation is done via the CLI script, not this API.
 * Run: npx tsx scripts/generate-podcast.ts --lang en --native pt --level A1 --topic "Your topic"
 * This route is kept for reference but should not be used for new content generation.
 */
// Admin/content-generation only. Long timeout for script + TTS + upload + exercises (not user-facing).
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const user = await getListeningAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'listening.api.notAuthenticated',
      );
    }
    const body = await req.json();
    const parsed = generatePodcastSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorHandler(parsed.error, req);
    }
    const useCase = makeGeneratePodcastUseCase();
    const podcast = await useCase.execute(parsed.data);
    return Response.json(podcast);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
