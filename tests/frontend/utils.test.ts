import {removeTrailingSlash} from '../../src/utils/removeTrailingSlash'; // Assuming the function is exported from utils file
import {describe, expect, it} from 'vitest';

describe('removeTrailingSlash', () => {
  it('should remove trailing slash', () => {
    const url = 'http://example.com/';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  it('should trim whitespace', () => {
    const url = ' http://example.com/ ';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  it('should handle url without trailing slash', () => {
    const url = 'http://example.com';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  it('should handle empty string', () => {
    const url = '';
    expect(removeTrailingSlash(url)).toBe('');
  });
});
