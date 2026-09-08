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

  it("returns false for Next.js App Router RSC / router GET fetches", () => {
    expect(
      shouldReturnUnauthorizedJson(
        withHeaders("GET", {
          rsc: "1",
          "next-router-state-tree": "[]",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
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
    // Older Safari omits Sec-Fetch-Dest/Mode; default fetch() often omits Accept.
    // That combo cannot be distinguished from a document GET, so we redirect.
    expect(shouldReturnUnauthorizedJson(withHeaders("GET"))).toBe(false);
  });
});
