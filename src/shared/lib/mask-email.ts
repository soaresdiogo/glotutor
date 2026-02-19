/**
 * Masks an email for display (e.g. "d*******es@gmail.com").
 * Shows first character of local part, asterisks, last 2 chars of local part, then @ and domain.
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf('@');
  if (at <= 0 || at === trimmed.length - 1) return '***@***';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!local || !domain) return '***@***';
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  const asterisks = '*'.repeat(Math.max(0, local.length - 3));
  const lastTwo = local.slice(-2);
  return `${local[0]}${asterisks}${lastTwo}@${domain}`;
}
