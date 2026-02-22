import { httpClient } from '@/shared/lib/http-client';

export type LevelEligibilityDto = {
  cefrLevel: string;
  levelName: string;
  isLevelCompleted: boolean;
  certificateIssued: boolean;
  certificateId: string | null;
  verificationCode: string | null;
};

export type CertificateEligibilityResponse = {
  language: string;
  levels: LevelEligibilityDto[];
};

export type CertificateIssueResponse = {
  id: string;
  verificationCode: string;
  studentName: string;
  language: string;
  languageName: string;
  cefrLevel: string;
  levelName: string;
  totalStudyMinutes: number;
  completedAt: string;
};

export type CertificateVerifyResponse = CertificateIssueResponse & {
  createdAt: string;
};

export const certificatesApi = {
  getEligibility(language: string): Promise<CertificateEligibilityResponse> {
    return httpClient
      .get(`certificates?language=${encodeURIComponent(language)}`)
      .json<CertificateEligibilityResponse>();
  },

  issue(data: {
    language: string;
    cefrLevel: string;
  }): Promise<CertificateIssueResponse> {
    return httpClient
      .post('certificates', { json: data })
      .json<CertificateIssueResponse>();
  },

  verify(code: string): Promise<CertificateVerifyResponse> {
    return httpClient
      .get(`certificates/verify/${encodeURIComponent(code)}`)
      .json<CertificateVerifyResponse>();
  },
};
