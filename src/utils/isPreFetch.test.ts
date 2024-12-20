// isPrefetch.test.ts
import { isPreFetch } from './isPreFetch';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

describe('isPreFetch', () => {
  const mockNextRequest = (headers: Record<string, string>) => {
    return {
      headers: new Headers(headers)
    } as NextRequest;
  };

  it('returns true when purpose header is prefetch', () => {
    const req = mockNextRequest({ purpose: 'prefetch' });
    expect(isPreFetch(req)).toBe(true);
  });

  it('returns true when x-purpose header is prefetch', () => {
    const req = mockNextRequest({ 'x-purpose': 'prefetch' });
    expect(isPreFetch(req)).toBe(true);
  });

  it('returns true when x-moz header is prefetch', () => {
    const req = mockNextRequest({ 'x-moz': 'prefetch' });
    expect(isPreFetch(req)).toBe(true);
  });

  it('returns false when no prefetch headers are present', () => {
    const req = mockNextRequest({});
    expect(isPreFetch(req)).toBe(false);
  });

  it('returns false when headers have different values', () => {
    const req = mockNextRequest({ 
      purpose: 'navigation',
      'x-purpose': 'fetch',
      'x-moz': 'load'
    });
    expect(isPreFetch(req)).toBe(false);
  });

  it('handles undefined request gracefully', () => {
    expect(isPreFetch(undefined as unknown as NextRequest)).toBe(false);
  });

  it('handles null headers gracefully', () => {
    const req = { headers: null } as unknown as NextRequest;
    expect(isPreFetch(req)).toBe(false);
  });
});