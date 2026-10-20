import { describe, expect, it } from 'vitest';
import contract from '../../../contract/validation-cases.json';
import { parseName } from './names';

describe('parseName runs the shared contract cases', () => {
  it.each(contract.name.cases)('$input', (testCase) => {
    const result = parseName(testCase.input);
    if (testCase.valid) {
      expect(result).toEqual({ ok: true, value: testCase.value });
    } else {
      expect(result).toEqual({ ok: false, error: testCase.error });
    }
  });
});
