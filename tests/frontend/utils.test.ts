import {removeTrailingSlash} from '../../src/utils/removeTrailingSlash'; // Assuming the function is exported from utils file

describe('removeTrailingSlash', () => {
  test('should remove trailing slash', () => {
    const url = 'http://example.com/';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  test('should trim whitespace', () => {
    const url = ' http://example.com/ ';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  test('should handle url without trailing slash', () => {
    const url = 'http://example.com';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  test('should handle empty string', () => {
    const url = '';
    expect(removeTrailingSlash(url)).toBe('');
  });
});
