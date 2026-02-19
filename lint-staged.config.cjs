// Avoid "argument list too long" / SIGKILL when passing too many files to eslint.
const ESLINT_MAX_ARGS = 15;

module.exports = {
  '**/*.{ts,tsx,js,jsx,json,md,css}': (filenames) => {
    if (!filenames.length) return [];
    const quoted = filenames.map((f) => `"${f}"`).join(' ');
    return [`npx cspell --no-progress ${quoted}`];
  },
  '**/*.{ts,tsx,js,jsx}': (filenames) => {
    if (!filenames.length) return [];
    const list = filenames.join(' ');
    const eslintCmd =
      filenames.length > ESLINT_MAX_ARGS
        ? 'npx eslint . --max-warnings=0'
        : `npx eslint --max-warnings=0 ${list}`;
    return [eslintCmd, `npx biome check --write ${list}`, `git add ${list}`];
  },
  '**/*.{json,jsonc}': (filenames) => {
    if (!filenames.length) return [];
    const list = filenames.join(' ');
    return [`npx biome check --write ${list}`, `git add ${list}`];
  },
};
