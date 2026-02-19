export type StudyTimeRecord = {
  date: string;
  minutesStudied: number;
  activitiesCompleted: number;
};

export interface IUserLanguageStudyTimeRepository {
  findByUserAndLanguageInDateRange(
    userId: string,
    language: string,
    startDate: string,
    endDate: string,
  ): Promise<StudyTimeRecord[]>;

  upsert(
    userId: string,
    language: string,
    date: string,
    data: { minutesStudied: number; activitiesCompleted: number },
  ): Promise<void>;
}
