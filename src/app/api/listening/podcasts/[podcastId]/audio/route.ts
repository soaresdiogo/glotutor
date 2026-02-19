import type { NextRequest } from 'next/server';

import { makeGetPodcastDetailUseCase } from '@/features/listening/application/factories/get-podcast-detail.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import {
  getKeyFromStoredUrl,
  streamObjectByKey,
} from '@/shared/lib/reading/s3-upload';

import { getListeningAuthUser } from '../../../get-auth-user';

/**
 * Streams podcast audio from S3/MinIO so the browser can play it.
 * Private buckets (e.g. MinIO) do not allow direct GET; this proxy uses server credentials.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> },
) {
  try {
    const user = await getListeningAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'listening.api.notAuthenticated',
      );
    }
    const { podcastId } = await params;
    const useCase = makeGetPodcastDetailUseCase();
    const podcast = await useCase.execute(user.id, podcastId);

    const hasValidUrl =
      typeof podcast.audioUrl === 'string' &&
      podcast.audioUrl.length > 0 &&
      /^https?:\/\//i.test(podcast.audioUrl);

    const key = getKeyFromStoredUrl(podcast.audioUrl);
    if (!key) {
      if (hasValidUrl) {
        return Response.redirect(podcast.audioUrl, 302);
      }
      return new Response('Audio not yet generated', { status: 404 });
    }
    const result = await streamObjectByKey(key);
    if (!result) {
      return new Response('Audio not found', { status: 404 });
    }
    return new Response(result.body, {
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
