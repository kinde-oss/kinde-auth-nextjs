import { describe, it, expect } from "vitest";
import { filterAuthUrlParams } from "./filterAuthUrlParams";

describe("filterAuthUrlParams", () => {
  it("keeps documented Kinde application parameters", () => {
    const params = new URLSearchParams({
      org_code: "org_123",
      login_hint: "user@example.com",
      connection_id: "conn_abc",
      lang: "en-AU",
      utm_source: "docs",
    });

    expect(filterAuthUrlParams(params)).toEqual({
      org_code: "org_123",
      login_hint: "user@example.com",
      connection_id: "conn_abc",
      lang: "en-AU",
      utm_source: "docs",
    });
  });

  it("drops OAuth protocol parameters", () => {
    const params = new URLSearchParams({
      org_code: "org_123",
      code_challenge: "attacker",
      code_challenge_method: "plain",
      response_mode: "fragment",
      prompt: "none",
      redirect_uri: "https://evil.example/callback",
      client_id: "spoofed",
      response_type: "token",
      scope: "admin",
      audience: "https://evil.example",
      client_secret: "secret",
    });

    expect(filterAuthUrlParams(params)).toEqual({
      org_code: "org_123",
    });
  });

  it("drops empty values and non-scalar JSON fields", () => {
    expect(
      filterAuthUrlParams({
        org_code: "org_123",
        login_hint: "",
        nested: { code_challenge: "attacker" },
      }),
    ).toEqual({ org_code: "org_123" });
  });

  it("returns an empty object for null, arrays, and missing input", () => {
    expect(filterAuthUrlParams(null)).toEqual({});
    expect(filterAuthUrlParams(undefined)).toEqual({});
    expect(filterAuthUrlParams([])).toEqual({});
  });
});
