import { describe, it, expect } from "vitest";
import { shouldReturnUnauthorizedJson } from "./shouldReturnUnauthorizedJson";

const withHeaders = (method: string, headers: Record<string, string> = {}) => ({
  method,
  headers: {
    get: (name: string) => headers[name.toLowerCase()] ?? null,
  },
});

describe("shouldReturnUnauthorizedJson", () => {
  it("returns true for non-safe methods", () => {
    expect(shouldReturnUnauthorizedJson(withHeaders("POST"))).toBe(true);
    expect(shouldReturnUnauthorizedJson(withHeaders("DELETE"))).toBe(true);
  });

  it("returns false for plain GET document navigations", () => {
    expect(
      shouldReturnUnauthorizedJson(
        withHeaders("GET", {
          accept: "text/html,application/xhtml+xml",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
        }),
      ),
    ).toBe(false);
  });

  it("returns true for GET with Sec-Fetch-Dest empty", () => {
    expect(
      shouldReturnUnauthorizedJson(
        withHeaders("GET", { "sec-fetch-dest": "empty" }),
      ),
    ).toBe(true);
  });

  it("returns true for GET with Sec-Fetch-Mode cors", () => {
    expect(
      shouldReturnUnauthorizedJson(
        withHeaders("GET", { "sec-fetch-mode": "cors" }),
      ),
    ).toBe(true);
  });

  it("returns true when Accept prefers application/json", () => {
    expect(
      shouldReturnUnauthorizedJson(
        withHeaders("GET", {
          accept: "application/json, text/plain, */*",
        }),
      ),
    ).toBe(true);
  });

  it("returns false when Accept prefers text/html over json", () => {
    expect(
      shouldReturnUnauthorizedJson(
        withHeaders("GET", {
          accept: "text/html,application/json",
        }),
      ),
    ).toBe(false);
  });

  it("returns false for GET with no API indicators", () => {
    expect(shouldReturnUnauthorizedJson(withHeaders("GET"))).toBe(false);
  });
});
