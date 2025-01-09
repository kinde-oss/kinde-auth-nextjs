// isPrefetch.test.ts
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { isPreFetch } from './isPreFetch';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

describe('isPreFetch', () => {
  const mockHeaders = (headers: Record<string, string>) => {
    return new Headers(headers) as ReadonlyHeaders
  };

  it('returns true when purpose header is prefetch', () => {
    const headers = mockHeaders({ purpose: 'prefetch' });
    expect(isPreFetch(headers)).toBe(true);
  });

  it('returns true when x-purpose header is prefetch', () => {
    const headers = mockHeaders({ 'x-purpose': 'prefetch' });
    expect(isPreFetch(headers)).toBe(true);
  });

  it('returns true when x-moz header is prefetch', () => {
    const headers = mockHeaders({ 'x-moz': 'prefetch' });
    expect(isPreFetch(headers)).toBe(true);
  });

  it('returns false when no prefetch headers are present', () => {
    const headers = mockHeaders({});
    expect(isPreFetch(headers)).toBe(false);
  });

  it('returns false when headers have different values', () => {
    const headers = mockHeaders({ 
      purpose: 'navigation',
      'x-purpose': 'fetch',
      'x-moz': 'load'
    });
    expect(isPreFetch(headers)).toBe(false);
  });
});