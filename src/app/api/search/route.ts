import { and, eq, ilike } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import { db } from '@/infrastructure/db/client';
import { nativeLessons } from '@/infrastructure/db/schema/native-lessons';
import { speakingTopics } from '@/infrastructure/db/schema/speaking-topics';
import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import { texts } from '@/infrastructure/db/schema/texts';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

const LIMIT = 5;

export type SearchResultLesson = { id: string; title: string; level: string };
export type SearchResultTopic = { id: string; slug: string; title: string };
export type SearchResultText = { id: string; title: string };

export type SearchResponse = {
  lessons: SearchResultLesson[];
  topics: SearchResultTopic[];
  texts: SearchResultText[];
};

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'search.api.notAuthenticated',
      );
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (q.length < 2) {
      return Response.json({
        lessons: [],
        topics: [],
        texts: [],
      } satisfies SearchResponse);
    }

    const pattern = `%${q}%`;
    const SEARCH_TIMEOUT_MS = 8_000;

    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id),
      columns: { targetLanguageId: true },
    });
    const targetLanguageId = profile?.targetLanguageId ?? null;
    const langRow = targetLanguageId
      ? await db.query.supportedLanguages.findFirst({
          where: eq(supportedLanguages.id, targetLanguageId),
          columns: { code: true },
        })
      : null;
    const languageCode = langRow?.code?.split('-')[0] ?? 'en';

    const searchPromise = Promise.all([
      db
        .select({
          id: nativeLessons.id,
          title: nativeLessons.title,
          level: nativeLessons.level,
        })
        .from(nativeLessons)
        .where(
          and(
            eq(nativeLessons.language, languageCode),
            eq(nativeLessons.isPublished, true),
            ilike(nativeLessons.title, pattern),
          ),
        )
        .limit(LIMIT),

      targetLanguageId
        ? db
            .select({
              id: speakingTopics.id,
              slug: speakingTopics.slug,
              title: speakingTopics.title,
            })
            .from(speakingTopics)
            .where(
              and(
                eq(speakingTopics.languageId, targetLanguageId),
                ilike(speakingTopics.title, pattern),
              ),
            )
            .limit(LIMIT)
        : Promise.resolve([]),

      targetLanguageId
        ? db
            .select({
              id: texts.id,
              title: texts.title,
            })
            .from(texts)
            .where(
              and(
                eq(texts.languageId, targetLanguageId),
                eq(texts.isPublished, true),
                ilike(texts.title, pattern),
              ),
            )
            .limit(LIMIT)
        : Promise.resolve([]),
    ]);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout')), SEARCH_TIMEOUT_MS);
    });

    let lessonsRows: SearchResultLesson[] = [];
    let topicsRows: SearchResultTopic[] = [];
    let textsRows: SearchResultText[] = [];

    try {
      const [l, t, tx] = await Promise.race([searchPromise, timeoutPromise]);
      lessonsRows = l.map((r) => ({
        id: r.id,
        title: r.title,
        level: r.level,
      }));
      topicsRows = t.map((r) => ({ id: r.id, slug: r.slug, title: r.title }));
      textsRows = tx.map((r) => ({ id: r.id, title: r.title }));
    } catch {
      return Response.json(
        {
          lessons: [],
          topics: [],
          texts: [],
        } satisfies SearchResponse,
        { status: 200 },
      );
    }

    const body: SearchResponse = {
      lessons: lessonsRows,
      topics: topicsRows,
      texts: textsRows,
    };

    return Response.json(body);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
