#!/usr/bin/env node
/**
 * Validates that every translation key from the reference locale (en)
 * exists in all other locale files. Fails if any key is missing.
 * Run before push to ensure copies are added to every language.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES_DIR = join(process.cwd(), 'src', 'locales');
const REFERENCE_LOCALE = 'en';
const LOCALE_EXT = '.json';

function getJsonKeys(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  return new Set(Object.keys(data));
}

function main() {
  const files = readdirSync(LOCALES_DIR).filter(
    (f) => f.endsWith(LOCALE_EXT) && f !== 'index.ts' && !f.startsWith('types'),
  );
  const referencePath = join(LOCALES_DIR, `${REFERENCE_LOCALE}${LOCALE_EXT}`);
  const referenceKeys = getJsonKeys(referencePath);
  let hasError = false;

  for (const file of files) {
    const locale = file.replace(LOCALE_EXT, '');
    if (locale === REFERENCE_LOCALE) continue;

    const path = join(LOCALES_DIR, file);
    const keys = getJsonKeys(path);

    const missing = [...referenceKeys].filter((k) => !keys.has(k));
    if (missing.length > 0) {
      console.error(
        `\n❌ ${file}: missing ${missing.length} key(s) from ${REFERENCE_LOCALE}.json:`,
      );
      for (const k of missing) console.error(`   - ${k}`);
      hasError = true;
    }

    const extra = [...keys].filter((k) => !referenceKeys.has(k));
    if (extra.length > 0) {
      console.error(
        `\n❌ ${file}: ${extra.length} key(s) not present in ${REFERENCE_LOCALE}.json:`,
      );
      for (const k of extra) console.error(`   + ${k}`);
      hasError = true;
    }
  }

  if (hasError) {
    console.error(
      '\n💡 Add every copy key to all locale files (en, pt, es, it, fr, de).\n',
    );
    process.exit(1);
  }

  console.log('✅ All locale files have the same copy keys.');
}

main();
