/**
 * Re-export shared student profile provider for backward compatibility.
 * Listening and Speaking both use the same profile data (language, CEFR, native language).
 */
export { StudentProfileProvider as StudentListeningProfileProvider } from '@/features/student-profile/infrastructure/student-profile.provider';
