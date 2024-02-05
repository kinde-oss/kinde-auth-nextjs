import {renderHook, waitFor} from '@testing-library/react';
import {useKindeBrowserClient} from '../../src/frontend/KindeBrowserClient';

describe('useKindeBrowserClient', () => {
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
  });
  afterEach(() => delete (global as any).fetch);

  test('should use default setup url', async () => {
    const mockedFetch = jest.fn();
    global.fetch = mockedFetch;

    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true
    } as any);

    const {result} = renderHook(() => useKindeBrowserClient(), {});
    await waitFor(() => {
      return expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/setup');
  });

  test('should use custom setup url when passed in as prop', async () => {
    const mockedFetch = jest.fn();
    global.fetch = mockedFetch;

    jest.spyOn(global, 'fetch').mockResolvedValue({
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

  test('should use custom setup url when using .env variable', async () => {
    process.env.KINDE_AUTH_API_PATH = '/api/custom-auth';

    const mockedFetch = jest.fn();
    global.fetch = mockedFetch;

    jest.spyOn(global, 'fetch').mockResolvedValue({
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
