import { describe, it, expect } from "vitest";
import { buildAuthRedirectUrl } from "./buildAuthRedirectUrl";

describe("buildAuthRedirectUrl", () => {
  it("returns the login page as-is when no options are set", () => {
    expect(buildAuthRedirectUrl("/api/auth/login", {})).toBe("/api/auth/login");
  });

  it("appends org_code when orgCode is provided", () => {
    const result = buildAuthRedirectUrl("/api/auth/login", {
      orgCode: "org_123",
    });
    expect(result).toBe("/api/auth/login?org_code=org_123");
  });

  it("appends post_login_redirect_url when isReturnToCurrentPage is true", () => {
    const result = buildAuthRedirectUrl("/api/auth/login", {
      isReturnToCurrentPage: true,
      pathname: "/dashboard",
      search: "?tab=overview",
    });
    expect(result).toBe(
      "/api/auth/login?post_login_redirect_url=%2Fdashboard%3Ftab%3Doverview",
    );
  });

  it("appends both org_code and post_login_redirect_url when both are set", () => {
    const result = buildAuthRedirectUrl("/api/auth/login", {
      orgCode: "org_123",
      isReturnToCurrentPage: true,
      pathname: "/dashboard",
      search: "",
    });
    expect(result).toBe(
      "/api/auth/login?org_code=org_123&post_login_redirect_url=%2Fdashboard",
    );
  });

  it("does not append post_login_redirect_url when isReturnToCurrentPage is false", () => {
    const result = buildAuthRedirectUrl("/api/auth/login", {
      isReturnToCurrentPage: false,
      pathname: "/dashboard",
      search: "?tab=overview",
    });
    expect(result).toBe("/api/auth/login");
  });

  it("handles missing pathname and search gracefully", () => {
    const result = buildAuthRedirectUrl("/api/auth/login", {
      isReturnToCurrentPage: true,
    });
    expect(result).toBe("/api/auth/login?post_login_redirect_url=");
  });
});
