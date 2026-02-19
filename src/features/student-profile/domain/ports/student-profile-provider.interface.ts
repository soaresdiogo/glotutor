export type StudentProfile = {
  languageCode: string;
  cefrLevel: string;
  nativeLanguageCode: string;
};

export interface IStudentProfileProvider {
  getProfile(userId: string): Promise<StudentProfile | null>;
}
