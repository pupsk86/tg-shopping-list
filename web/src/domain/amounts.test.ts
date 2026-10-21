import { describe, expect, it } from 'vitest';
import contract from '../../../contract/validation-cases.json';
import { formatAmount, parseAmount } from './amounts';

describe('parseAmount runs the shared contract cases', () => {
  it.each(contract.amount.cases)('"$input"', (testCase) => {
    const result = parseAmount(testCase.input);
    if (testCase.valid) {
      expect(result).toEqual({ ok: true, value: testCase.value });
    } else {
      expect(result).toEqual({ ok: false, error: testCase.error });
    }
  });
});

describe('formatAmount', () => {
  it('shows decimals with a comma and whole numbers as they are', () => {
    expect(formatAmount(1.5)).toBe('1,5');
    expect(formatAmount(0.25)).toBe('0,25');
    expect(formatAmount(10)).toBe('10');
  });
});
