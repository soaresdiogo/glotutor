import { asc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import { db } from '@/infrastructure/db/client';
import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export type StudentProfileResponse = {
  id: string;
  userId: string;
  targetLanguageId: string;
  nativeLanguageCode: string;
  currentLevel: string;
  learningGoal: string | null;
  targetLanguage?: { id: string; code: string; name: string };
};

export type SupportedLanguageOption = {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const NATIVE_LANGUAGE_CODES = [
  'pt-BR',
  'en',
  'es',
  'fr',
  'de',
  'it',
  'ja',
  'zh',
] as const;

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parsePatchBody(body: unknown) {
  const raw = body as Record<string, unknown>;
  return {
    nativeLanguageCode: optionalString(raw.nativeLanguageCode),
    targetLanguageId: optionalString(raw.targetLanguageId),
    currentLevel: optionalString(raw.currentLevel),
  };
}

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'profile.api.notAuthenticated',
      );
    }

    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id),
      with: {
        targetLanguage: { columns: { id: true, code: true, name: true } },
      },
    });

    const languageRows = await db
      .select({
        id: supportedLanguages.id,
        code: supportedLanguages.code,
        name: supportedLanguages.name,
        nativeName: supportedLanguages.nativeName,
      })
      .from(supportedLanguages)
      .where(eq(supportedLanguages.isActive, true))
      .orderBy(asc(supportedLanguages.code));

    const body = {
      profile: profile
        ? {
            id: profile.id,
            userId: profile.userId,
            targetLanguageId: profile.targetLanguageId,
            nativeLanguageCode: profile.nativeLanguageCode,
            currentLevel: profile.currentLevel,
            learningGoal: profile.learningGoal,
            targetLanguage: profile.targetLanguage
              ? {
                  id: profile.targetLanguage.id,
                  code: profile.targetLanguage.code,
                  name: profile.targetLanguage.name,
                }
              : undefined,
          }
        : null,
      supportedLanguages: languageRows.map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
      })),
      options: {
        cefrLevels: CEFR_LEVELS,
        nativeLanguageCodes: NATIVE_LANGUAGE_CODES,
      },
    };

    return Response.json(body);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}

async function updateExistingProfile(
  existing: typeof studentProfiles.$inferSelect & { id: string },
  parsed: ReturnType<typeof parsePatchBody>,
) {
  const updates: Record<string, string> = {};
  if (parsed.nativeLanguageCode != null)
    updates.nativeLanguageCode = parsed.nativeLanguageCode;
  if (parsed.targetLanguageId != null)
    updates.targetLanguageId = parsed.targetLanguageId;
  if (parsed.currentLevel != null) updates.currentLevel = parsed.currentLevel;
  if (Object.keys(updates).length === 0) {
    return Response.json({ ok: true, profile: existing });
  }
  const [updated] = await db
    .update(studentProfiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(studentProfiles.id, existing.id))
    .returning();
  return Response.json({ ok: true, profile: updated });
}

async function createNewProfile(
  userId: string,
  parsed: ReturnType<typeof parsePatchBody>,
) {
  if (!parsed.targetLanguageId) {
    throw new BadRequestError(
      'targetLanguageId is required to create a profile.',
      'profile.api.targetLanguageRequired',
    );
  }
  const [created] = await db
    .insert(studentProfiles)
    .values({
      userId,
      targetLanguageId: parsed.targetLanguageId,
      nativeLanguageCode: parsed.nativeLanguageCode ?? 'pt-BR',
      currentLevel: parsed.currentLevel ?? 'A1',
    })
    .returning();
  return Response.json({ ok: true, profile: created });
}

export async function PATCH(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'profile.api.notAuthenticated',
      );
    }

    const body = await req.json();
    const parsed = parsePatchBody(body);
    const existing = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id),
    });

    if (existing) {
      return updateExistingProfile(existing, parsed);
    }
    return createNewProfile(user.id, parsed);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
