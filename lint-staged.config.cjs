// Avoid "argument list too long" / SIGKILL when passing too many files to eslint.
const ESLINT_MAX_ARGS = 15;

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// CSpell ignores src/locales/*.json; if only those are passed it checks 0 files and exits 1.
function withoutLocaleJson(files) {
  return files.filter((f) => !(f.includes('src/locales/') && f.endsWith('.json')));
}

module.exports = {
  '**/*.{ts,tsx,js,jsx,json,md,css}': (filenames) => {
    const toCheck = withoutLocaleJson(filenames);
    if (!toCheck.length) return [];
    const quoted = toCheck.map((f) => `"${f}"`).join(' ');
    return [`npx cspell --no-progress ${quoted}`];
  },
  '**/*.{ts,tsx,js,jsx}': (filenames) => {
    if (!filenames.length) return [];
    const list = filenames.join(' ');
    // Run eslint in chunks to avoid SIGKILL; never lint whole repo from lint-staged.
    const eslintCmds =
      filenames.length > ESLINT_MAX_ARGS
        ? chunk(filenames, ESLINT_MAX_ARGS).map((chunkFiles) => {
            const quoted = chunkFiles.map((f) => `"${f}"`).join(' ');
            return `npx eslint --max-warnings=0 ${quoted}`;
          })
        : [`npx eslint --max-warnings=0 ${list}`];
    return [...eslintCmds, `npx biome check --write ${list}`, `git add ${list}`];
  },
  '**/*.{json,jsonc}': (filenames) => {
    if (!filenames.length) return [];
    const list = filenames.join(' ');
    return [`npx biome check --write ${list}`, `git add ${list}`];
  },
};
