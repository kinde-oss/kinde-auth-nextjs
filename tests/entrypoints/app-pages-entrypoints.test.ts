import { describe, it, expect } from "vitest";

describe("entrypoint surfaces", () => {
  it("app server exports new helpers", async () => {
    const mod = await import("@kinde-oss/kinde-auth-nextjs/app/server");
    expect((mod as any).createAppServerHelpers).toBeTypeOf("function");
    // Assert absence of legacy wrapper
    expect(
      Object.prototype.hasOwnProperty.call(mod, "createAppRouterSession")
    ).toBe(false);
  });
  it("pages server exports new helpers", async () => {
    const mod = await import("@kinde-oss/kinde-auth-nextjs/pages/server");
    expect((mod as any).createPagesServerHelpers).toBeTypeOf("function");
    expect(
      Object.prototype.hasOwnProperty.call(mod, "createPagesRouterSession")
    ).toBe(false);
  });
});
