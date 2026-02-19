import { relations } from 'drizzle-orm';
import { achievements } from './achievements';
import { audioLessons } from './audio-lessons';
import { audioSegments } from './audio-segments';
import { auditLogs } from './audit-logs';
import { certificationExamAnswers } from './certification-exam-answers';
import { certificationExams } from './certification-exams';
import { consentRecords } from './consent-records';
import { contentGenerationJobs } from './content-generation-jobs';
import { courses } from './courses';
import { dailyProgress } from './daily-progress';
import { dataRequests } from './data-requests';
import { emailLogs } from './email-logs';
import { emailVerificationTokens } from './email-verification-tokens';
import { interviewTemplates } from './interview-templates';
import { lessons } from './lessons';
import { levelProgress } from './level-progress';
import { listeningSessions } from './listening-sessions';
import { loginAttempts } from './login-attempts';
import { mfaBackupCodes } from './mfa-backup-codes';
import { mfaSessions } from './mfa-sessions';
import { modules } from './modules';
import { nativeLessonProgress } from './native-lesson-progress';
import { nativeLessons } from './native-lessons';
import { passwordResetTokens } from './password-reset-tokens';
import { paymentHistory } from './payment-history';
import { placementTestAnswers } from './placement-test-answers';
import { placementTestAttempts } from './placement-test-attempts';
import { placementTestQuestions } from './placement-test-questions';
import { podcastExercises } from './podcast-exercises';
import { podcasts } from './podcasts';
import { practiceSessions } from './practice-sessions';
import { practiceTurns } from './practice-turns';
import { prices } from './prices';
import { products } from './products';
import { readingSessions } from './reading-sessions';
import { sessions } from './sessions';
import { speakingExerciseAttempts } from './speaking-exercise-attempts';
import { speakingExercises } from './speaking-exercises';
import { speakingSessionUsage } from './speaking-session-usage';
import { speakingSessions } from './speaking-sessions';
import { speakingTopics } from './speaking-topics';
import { studentCourseEnrollments } from './student-course-enrollments';
import { studentLessonProgress } from './student-lesson-progress';
import { studentModuleProgress } from './student-module-progress';
import { studentPodcastProgress } from './student-podcast-progress';
import { studentProfiles } from './student-profiles';
import { subscriptions } from './subscriptions';
import { supportedLanguages } from './supported-languages';
import { teacherConversations } from './teacher-conversations';
import { teacherMessages } from './teacher-messages';
import { tenantAdmins } from './tenant-admins';
import { tenants } from './tenants';
import { textVocabulary } from './text-vocabulary';
import { texts } from './texts';
import { userAchievements } from './user-achievements';
import { userLanguagePreferences } from './user-language-preferences';
import { userLanguageProgress } from './user-language-progress';
import { userLanguageStreaks } from './user-language-streaks';
import { userLanguageStudyTime } from './user-language-study-time';
import { userVocabulary } from './user-vocabulary';
import { users } from './users';

export const tenantsRelations = relations(tenants, ({ many }) => ({
  admins: many(tenantAdmins),
  users: many(users),
  products: many(products),
  courses: many(courses),
  texts: many(texts),
  audioLessons: many(audioLessons),
  interviewTemplates: many(interviewTemplates),
  subscriptions: many(subscriptions),
  emailLogs: many(emailLogs),
  auditLogs: many(auditLogs),
  contentJobs: many(contentGenerationJobs),
  studentProfiles: many(studentProfiles),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  profile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  sessions: many(sessions),
  emailVerificationTokens: many(emailVerificationTokens),
  passwordResetTokens: many(passwordResetTokens),
  mfaBackupCodes: many(mfaBackupCodes),
  mfaSessions: many(mfaSessions),
  loginAttempts: many(loginAttempts),
  consentRecords: many(consentRecords),
  dataRequests: many(dataRequests),
  subscriptions: many(subscriptions),
  dailyProgress: many(dailyProgress),
  courseEnrollments: many(studentCourseEnrollments),
  moduleProgress: many(studentModuleProgress),
  lessonProgress: many(studentLessonProgress),
  readingSessions: many(readingSessions),
  listeningSessions: many(listeningSessions),
  speakingSessions: many(speakingSessions),
  podcastProgress: many(studentPodcastProgress),
  nativeLessonProgress: many(nativeLessonProgress),
  placementTestAttempts: many(placementTestAttempts),
  userLanguageProgress: many(userLanguageProgress),
  levelProgress: many(levelProgress),
  certificationExams: many(certificationExams),
  userLanguagePreferences: one(userLanguagePreferences, {
    fields: [users.id],
    references: [userLanguagePreferences.userId],
  }),
  userLanguageStreaks: many(userLanguageStreaks),
  userLanguageStudyTime: many(userLanguageStudyTime),
  practiceSessions: many(practiceSessions),
  userVocabulary: many(userVocabulary),
  teacherConversations: many(teacherConversations),
  userAchievements: many(userAchievements),
  paymentHistory: many(paymentHistory),
  tenantAdmins: many(tenantAdmins),
}));

export const supportedLanguagesRelations = relations(
  supportedLanguages,
  ({ many }) => ({
    studentProfiles: many(studentProfiles),
    courses: many(courses),
    texts: many(texts),
    audioLessons: many(audioLessons),
    podcasts: many(podcasts),
    practiceSessions: many(practiceSessions),
    userVocabulary: many(userVocabulary),
    teacherConversations: many(teacherConversations),
    interviewTemplates: many(interviewTemplates),
    contentJobs: many(contentGenerationJobs),
    speakingTopics: many(speakingTopics),
  }),
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  language: one(supportedLanguages, {
    fields: [courses.languageId],
    references: [supportedLanguages.id],
  }),
  tenant: one(tenants, {
    fields: [courses.tenantId],
    references: [tenants.id],
  }),
  modules: many(modules),
  enrollments: many(studentCourseEnrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  progress: many(studentModuleProgress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(studentLessonProgress),
}));

export const textsRelations = relations(texts, ({ one, many }) => ({
  language: one(supportedLanguages, {
    fields: [texts.languageId],
    references: [supportedLanguages.id],
  }),
  tenant: one(tenants, {
    fields: [texts.tenantId],
    references: [tenants.id],
  }),
  vocabulary: many(textVocabulary),
  readingSessions: many(readingSessions),
  audioLessons: many(audioLessons),
}));

export const audioLessonsRelations = relations(
  audioLessons,
  ({ one, many }) => ({
    language: one(supportedLanguages, {
      fields: [audioLessons.languageId],
      references: [supportedLanguages.id],
    }),
    tenant: one(tenants, {
      fields: [audioLessons.tenantId],
      references: [tenants.id],
    }),
    sourceText: one(texts, {
      fields: [audioLessons.sourceTextId],
      references: [texts.id],
    }),
    segments: many(audioSegments),
    listeningSessions: many(listeningSessions),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one, many }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
    tenant: one(tenants, {
      fields: [subscriptions.tenantId],
      references: [tenants.id],
    }),
    price: one(prices, {
      fields: [subscriptions.priceId],
      references: [prices.id],
    }),
    payments: many(paymentHistory),
  }),
);

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [practiceSessions.userId],
      references: [users.id],
    }),
    language: one(supportedLanguages, {
      fields: [practiceSessions.languageId],
      references: [supportedLanguages.id],
    }),
    turns: many(practiceTurns),
  }),
);

export const teacherConversationsRelations = relations(
  teacherConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [teacherConversations.userId],
      references: [users.id],
    }),
    language: one(supportedLanguages, {
      fields: [teacherConversations.languageId],
      references: [supportedLanguages.id],
    }),
    messages: many(teacherMessages),
  }),
);

export const teacherMessagesRelations = relations(
  teacherMessages,
  ({ one }) => ({
    conversation: one(teacherConversations, {
      fields: [teacherMessages.conversationId],
      references: [teacherConversations.id],
    }),
  }),
);

export const textVocabularyRelations = relations(textVocabulary, ({ one }) => ({
  text: one(texts, {
    fields: [textVocabulary.textId],
    references: [texts.id],
  }),
}));

export const readingSessionsRelations = relations(
  readingSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [readingSessions.userId],
      references: [users.id],
    }),
    text: one(texts, {
      fields: [readingSessions.textId],
      references: [texts.id],
    }),
  }),
);

export const speakingTopicsRelations = relations(
  speakingTopics,
  ({ one, many }) => ({
    language: one(supportedLanguages, {
      fields: [speakingTopics.languageId],
      references: [supportedLanguages.id],
    }),
    sessions: many(speakingSessions),
    exercises: many(speakingExercises),
  }),
);

export const speakingSessionsRelations = relations(
  speakingSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [speakingSessions.userId],
      references: [users.id],
    }),
    topic: one(speakingTopics, {
      fields: [speakingSessions.topicId],
      references: [speakingTopics.id],
    }),
    exerciseAttempts: many(speakingExerciseAttempts),
    usage: one(speakingSessionUsage),
  }),
);

export const speakingSessionUsageRelations = relations(
  speakingSessionUsage,
  ({ one }) => ({
    session: one(speakingSessions, {
      fields: [speakingSessionUsage.sessionId],
      references: [speakingSessions.id],
    }),
    user: one(users, {
      fields: [speakingSessionUsage.userId],
      references: [users.id],
    }),
  }),
);

export const speakingExercisesRelations = relations(
  speakingExercises,
  ({ one }) => ({
    topic: one(speakingTopics, {
      fields: [speakingExercises.topicId],
      references: [speakingTopics.id],
    }),
  }),
);

export const speakingExerciseAttemptsRelations = relations(
  speakingExerciseAttempts,
  ({ one }) => ({
    session: one(speakingSessions, {
      fields: [speakingExerciseAttempts.sessionId],
      references: [speakingSessions.id],
    }),
    exercise: one(speakingExercises, {
      fields: [speakingExerciseAttempts.exerciseId],
      references: [speakingExercises.id],
    }),
    user: one(users, {
      fields: [speakingExerciseAttempts.userId],
      references: [users.id],
    }),
  }),
);

export const audioSegmentsRelations = relations(audioSegments, ({ one }) => ({
  audioLesson: one(audioLessons, {
    fields: [audioSegments.audioLessonId],
    references: [audioLessons.id],
  }),
}));

export const listeningSessionsRelations = relations(
  listeningSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [listeningSessions.userId],
      references: [users.id],
    }),
    audioLesson: one(audioLessons, {
      fields: [listeningSessions.audioLessonId],
      references: [audioLessons.id],
    }),
  }),
);

export const podcastsRelations = relations(podcasts, ({ one, many }) => ({
  language: one(supportedLanguages, {
    fields: [podcasts.languageId],
    references: [supportedLanguages.id],
  }),
  exercises: many(podcastExercises),
  studentProgress: many(studentPodcastProgress),
}));

export const podcastExercisesRelations = relations(
  podcastExercises,
  ({ one }) => ({
    podcast: one(podcasts, {
      fields: [podcastExercises.podcastId],
      references: [podcasts.id],
    }),
  }),
);

export const studentPodcastProgressRelations = relations(
  studentPodcastProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [studentPodcastProgress.userId],
      references: [users.id],
    }),
    podcast: one(podcasts, {
      fields: [studentPodcastProgress.podcastId],
      references: [podcasts.id],
    }),
  }),
);

export const nativeLessonsRelations = relations(nativeLessons, ({ many }) => ({
  progress: many(nativeLessonProgress),
}));

export const nativeLessonProgressRelations = relations(
  nativeLessonProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [nativeLessonProgress.userId],
      references: [users.id],
    }),
    lesson: one(nativeLessons, {
      fields: [nativeLessonProgress.lessonId],
      references: [nativeLessons.id],
    }),
  }),
);

export const placementTestQuestionsRelations = relations(
  placementTestQuestions,
  ({ many }) => ({
    answers: many(placementTestAnswers),
    certificationAnswers: many(certificationExamAnswers),
  }),
);

export const placementTestAttemptsRelations = relations(
  placementTestAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [placementTestAttempts.userId],
      references: [users.id],
    }),
    answers: many(placementTestAnswers),
    userLanguageProgress: many(userLanguageProgress),
  }),
);

export const placementTestAnswersRelations = relations(
  placementTestAnswers,
  ({ one }) => ({
    attempt: one(placementTestAttempts, {
      fields: [placementTestAnswers.attemptId],
      references: [placementTestAttempts.id],
    }),
    question: one(placementTestQuestions, {
      fields: [placementTestAnswers.questionId],
      references: [placementTestQuestions.id],
    }),
  }),
);

export const userLanguageProgressRelations = relations(
  userLanguageProgress,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userLanguageProgress.userId],
      references: [users.id],
    }),
    placementTest: one(placementTestAttempts, {
      fields: [userLanguageProgress.placementTestId],
      references: [placementTestAttempts.id],
    }),
    levelProgress: many(levelProgress),
  }),
);

export const levelProgressRelations = relations(levelProgress, ({ one }) => ({
  user: one(users, {
    fields: [levelProgress.userId],
    references: [users.id],
  }),
}));

export const certificationExamsRelations = relations(
  certificationExams,
  ({ one, many }) => ({
    user: one(users, {
      fields: [certificationExams.userId],
      references: [users.id],
    }),
    answers: many(certificationExamAnswers),
  }),
);

export const certificationExamAnswersRelations = relations(
  certificationExamAnswers,
  ({ one }) => ({
    exam: one(certificationExams, {
      fields: [certificationExamAnswers.examId],
      references: [certificationExams.id],
    }),
    question: one(placementTestQuestions, {
      fields: [certificationExamAnswers.questionId],
      references: [placementTestQuestions.id],
    }),
  }),
);

export const userLanguagePreferencesRelations = relations(
  userLanguagePreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userLanguagePreferences.userId],
      references: [users.id],
    }),
  }),
);

export const userLanguageStreaksRelations = relations(
  userLanguageStreaks,
  ({ one }) => ({
    user: one(users, {
      fields: [userLanguageStreaks.userId],
      references: [users.id],
    }),
  }),
);

export const userLanguageStudyTimeRelations = relations(
  userLanguageStudyTime,
  ({ one }) => ({
    user: one(users, {
      fields: [userLanguageStudyTime.userId],
      references: [users.id],
    }),
  }),
);

export const practiceTurnsRelations = relations(practiceTurns, ({ one }) => ({
  session: one(practiceSessions, {
    fields: [practiceTurns.sessionId],
    references: [practiceSessions.id],
  }),
}));

export const studentCourseEnrollmentsRelations = relations(
  studentCourseEnrollments,
  ({ one }) => ({
    user: one(users, {
      fields: [studentCourseEnrollments.userId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [studentCourseEnrollments.courseId],
      references: [courses.id],
    }),
  }),
);

export const studentModuleProgressRelations = relations(
  studentModuleProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [studentModuleProgress.userId],
      references: [users.id],
    }),
    module: one(modules, {
      fields: [studentModuleProgress.moduleId],
      references: [modules.id],
    }),
  }),
);

export const studentLessonProgressRelations = relations(
  studentLessonProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [studentLessonProgress.userId],
      references: [users.id],
    }),
    lesson: one(lessons, {
      fields: [studentLessonProgress.lessonId],
      references: [lessons.id],
    }),
  }),
);

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [paymentHistory.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [paymentHistory.userId],
    references: [users.id],
  }),
}));

export const tenantAdminsRelations = relations(tenantAdmins, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantAdmins.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantAdmins.userId],
    references: [users.id],
  }),
}));

export const interviewTemplatesRelations = relations(
  interviewTemplates,
  ({ one }) => ({
    language: one(supportedLanguages, {
      fields: [interviewTemplates.languageId],
      references: [supportedLanguages.id],
    }),
    tenant: one(tenants, {
      fields: [interviewTemplates.tenantId],
      references: [tenants.id],
    }),
  }),
);

export const studentProfilesRelations = relations(
  studentProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [studentProfiles.userId],
      references: [users.id],
    }),
    tenant: one(tenants, {
      fields: [studentProfiles.tenantId],
      references: [tenants.id],
    }),
    targetLanguage: one(supportedLanguages, {
      fields: [studentProfiles.targetLanguageId],
      references: [supportedLanguages.id],
    }),
  }),
);

export const userVocabularyRelations = relations(userVocabulary, ({ one }) => ({
  user: one(users, {
    fields: [userVocabulary.userId],
    references: [users.id],
  }),
  language: one(supportedLanguages, {
    fields: [userVocabulary.languageId],
    references: [supportedLanguages.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  }),
);

export const contentGenerationJobsRelations = relations(
  contentGenerationJobs,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [contentGenerationJobs.tenantId],
      references: [tenants.id],
    }),
    language: one(supportedLanguages, {
      fields: [contentGenerationJobs.languageId],
      references: [supportedLanguages.id],
    }),
  }),
);

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  user: one(users, {
    fields: [consentRecords.userId],
    references: [users.id],
  }),
}));

export const dataRequestsRelations = relations(dataRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataRequests.userId],
    references: [users.id],
  }),
}));

export const mfaSessionsRelations = relations(mfaSessions, ({ one }) => ({
  user: one(users, {
    fields: [mfaSessions.userId],
    references: [users.id],
  }),
}));
