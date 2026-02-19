module.exports = {
  '**/*.{ts,tsx,js,jsx,json,jsonc}': (filenames) => {
    return [
      `npx biome check --write ${filenames.join(' ')}`,
      `git add ${filenames.join(' ')}`,
    ];
  },
};
