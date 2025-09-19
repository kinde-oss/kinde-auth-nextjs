import { describe, it, expect } from 'vitest';

// Smoke tests

describe('New app/pages entrypoints (non-breaking additive)', () => {
  it('app client exports', async () => {
    const mod = await import('@kinde-oss/kinde-auth-nextjs/app');
    expect(mod.KindeProvider).toBeDefined();
    expect(mod.useKindeAuth).toBeTypeOf('function');
    expect(mod.LoginLink).toBeDefined();
  });

  it('app server exports', async () => {
    const mod = await import('@kinde-oss/kinde-auth-nextjs/app/server');
    expect(mod.getKindeServerSession).toBeTypeOf('function');
    expect(mod.withAuth).toBeTypeOf('function');
  expect(mod.createAppRouterSession).toBeTypeOf("function");
  });

  it('pages client exports', async () => {
    const mod = await import('@kinde-oss/kinde-auth-nextjs/pages');
    expect(mod.KindeProvider).toBeDefined();
    expect(mod.useKindeAuth).toBeTypeOf('function');
  });

  it('pages server exports', async () => {
    const mod = await import('@kinde-oss/kinde-auth-nextjs/pages/server');
    expect(mod.getKindeServerSession).toBeTypeOf('function');
    expect(mod.withAuth).toBeTypeOf('function');
  expect(mod.createPagesRouterSession).toBeTypeOf("function");
  });
});
