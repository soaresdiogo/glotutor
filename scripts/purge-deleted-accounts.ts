/**
 * LGPD/GDPR: Run this script periodically (e.g. daily cron) to anonymize PII
 * of users who requested deletion and were soft-deleted more than 30 days ago.
 *
 * Example cron (daily at 3am): 0 3 * * * cd /path/to/project && npx tsx scripts/purge-deleted-accounts.ts
 */
import { makePurgeDeletedAccountsUseCase } from '../src/features/users/application/factories/purge-deleted-accounts.factory';

async function main() {
  const useCase = makePurgeDeletedAccountsUseCase();
  const { purgedCount } = await useCase.execute();
  console.log(`Purged ${purgedCount} deleted account(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
