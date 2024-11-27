import {renderHook, waitFor} from '@testing-library/react';
import {useKindeBrowserClient} from '../../src/frontend/KindeBrowserClient';
import {describe, expect, it, beforeEach, afterEach, vi} from 'vitest';

describe('useKindeBrowserClient', () => {
  beforeEach(() => {
    vi.resetModules(); // Most important - it clears the cache
  });
  afterEach(() => delete (global as any).fetch);

  it('should use default setup url', async () => {
    const mockedFetch = vi.fn();
    global.fetch = mockedFetch;

    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true
    } as any);

    const {result} = renderHook(() => useKindeBrowserClient(), {});
    await waitFor(() => {
      return expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/setup');
  });

  it('should use custom setup url when passed in as prop', async () => {
    const mockedFetch = vi.fn();
    global.fetch = mockedFetch;

    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true
    } as any);

    const {result} = renderHook(() =>
      useKindeBrowserClient('/api/custom-auth')
    );
    await waitFor(() => {
      return expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/custom-auth/setup');
  });

  it('should use custom setup url when using .env variable', async () => {
    process.env.KINDE_AUTH_API_PATH = '/api/custom-auth';

    const mockedFetch = vi.fn();
    global.fetch = mockedFetch;

    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true
    } as any);

    const {result} = renderHook(() => useKindeBrowserClient());
    await waitFor(() => {
      return expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/custom-auth/setup');
    delete process.env.KINDE_AUTH_API_PATH;
  });
});
