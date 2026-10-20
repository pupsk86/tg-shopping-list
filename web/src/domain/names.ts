export const MAX_NAME_LENGTH = 100;

export type NameError = 'empty' | 'tooLong';
export type NameResult = { ok: true; value: string } | { ok: false; error: NameError };

/**
 * The rule for Shopping List and Item names, kept in step with the V2 server by
 * `contract/validation-cases.json`. Only spaces, tabs and line breaks are trimmed, so Java's
 * `strip()` and this agree; length counts code points, so an emoji is one character.
 */
export function parseName(input: string): NameResult {
  const value = input.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  // Code points on purpose: Java's codePointCount gives the same number.
  // eslint-disable-next-line @typescript-eslint/no-misused-spread
  const length = [...value].length;
  if (length === 0) return { ok: false, error: 'empty' };
  if (length > MAX_NAME_LENGTH) return { ok: false, error: 'tooLong' };
  return { ok: true, value };
}

export const nameErrorMessages: Record<NameError, string> = {
  empty: 'Enter a name.',
  tooLong: `Use ${String(MAX_NAME_LENGTH)} characters or fewer.`,
};
