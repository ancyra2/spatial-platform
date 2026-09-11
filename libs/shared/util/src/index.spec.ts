import { describe, expect, it } from 'vitest';
import { isRecord } from './index';

describe('isRecord', () => {
  it('narrows objects while rejecting null, arrays and primitives', () => {
    expect(isRecord({ message: 'bad request' })).toBe(true);
    for (const value of [null, [], 'message', 4, undefined]) {
      expect(isRecord(value)).toBe(false);
    }
  });
});
