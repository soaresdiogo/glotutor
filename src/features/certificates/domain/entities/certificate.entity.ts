export type CertificateEntity = {
  id: string;
  userId: string;
  language: string;
  cefrLevel: string;
  studentName: string;
  languageName: string;
  levelName: string;
  totalStudyMinutes: number;
  completedAt: Date;
  verificationCode: string;
  createdAt: Date;
};
