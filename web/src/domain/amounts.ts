export const MAX_AMOUNT_DECIMALS = 2;

export type AmountError = 'notANumber' | 'notPositive' | 'tooManyDecimals';
export type AmountResult = { ok: true; value: number | null } | { ok: false; error: AmountError };

/**
 * The rule for an Item's Amount, kept in step with the V2 server by
 * `contract/validation-cases.json`. Blank means no Amount. Otherwise it is a plain number above 0
 * with up to 2 decimals, written with a comma or a dot; no signs other than a leading minus, no
 * thousands separators, no exponents.
 */
export function parseAmount(input: string): AmountResult {
  const text = input.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  if (text === '') return { ok: true, value: null };
  const match = /^(-?)(\d+)(?:[.,](\d+))?$/.exec(text);
  if (!match) return { ok: false, error: 'notANumber' };
  const [, minus = '', whole = '', decimals = ''] = match;
  if (decimals.length > MAX_AMOUNT_DECIMALS) return { ok: false, error: 'tooManyDecimals' };
  const value = Number(`${whole}.${decimals || '0'}`);
  if (minus || value === 0) return { ok: false, error: 'notPositive' };
  return { ok: true, value };
}

/** How an Amount is shown: decimals with a comma, as in the prototype Kosta picked. */
export function formatAmount(amount: number): string {
  return String(amount).replace('.', ',');
}

export const amountErrorMessages: Record<AmountError, string> = {
  notANumber: 'Amount must be a number, like 2 or 1,5.',
  notPositive: 'Amount must be above 0.',
  tooManyDecimals: `Use up to ${String(MAX_AMOUNT_DECIMALS)} decimals in the Amount.`,
};
