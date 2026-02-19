import { httpClient } from '@/shared/lib/http-client';

export type StudentProfileDto = {
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

export type StudentProfileGetResponse = {
  profile: StudentProfileDto | null;
  supportedLanguages: SupportedLanguageOption[];
  options: {
    cefrLevels: readonly string[];
    nativeLanguageCodes: readonly string[];
  };
};

export type StudentProfilePatchPayload = {
  nativeLanguageCode?: string;
  targetLanguageId?: string;
  currentLevel?: string;
};

export const studentProfileApi = {
  get: () =>
    httpClient.get('student-profile').json<StudentProfileGetResponse>(),

  update: (payload: StudentProfilePatchPayload) =>
    httpClient
      .patch('student-profile', { json: payload })
      .json<{ ok: boolean; profile: StudentProfileDto }>(),
};
