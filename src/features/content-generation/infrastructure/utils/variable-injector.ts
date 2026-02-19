/**
 * Replaces {variableName} placeholders in prompt templates with actual values.
 * Objects are JSON.stringify'd; primitives are String()'d.
 */

export function injectVariables(
  template: string,
  variables: Record<string, unknown>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) => {
    if (key in variables) {
      const value = variables[key];
      if (value === undefined || value === null) return match;
      if (typeof value === 'string') return value;
      if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
      )
        return String(value);
      if (typeof value === 'symbol') return value.toString();
      return JSON.stringify(value, null, 2);
    }
    return match;
  });
}
