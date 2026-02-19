export type StudentProfileForReadingEntity = {
  currentLevel: string;
  nativeLanguageCode: string | null;
};

export interface IStudentProfileRepository {
  findForReadingByUserId(
    userId: string,
  ): Promise<StudentProfileForReadingEntity | null>;
}
