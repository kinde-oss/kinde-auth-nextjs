import { describe, it, expect } from "vitest";
import { isPreFetch } from "./isPreFetch";

describe("isPreFetch", () => {
  it("should return true when purpose header is prefetch", () => {
    const headers = new Headers({
      purpose: "prefetch",
    });
    expect(isPreFetch(headers)).toBe(true);
  });

  it("should return true when x-purpose header is prefetch", () => {
    const headers = new Headers({
      "x-purpose": "prefetch",
    });
    expect(isPreFetch(headers)).toBe(true);
  });

  it("should return true when x-moz header is prefetch", () => {
    const headers = new Headers({
      "x-moz": "prefetch",
    });
    expect(isPreFetch(headers)).toBe(true);
  });

  it("should return false when no prefetch headers are present", () => {
    const headers = new Headers({
      "content-type": "application/json",
    });
    expect(isPreFetch(headers)).toBe(false);
  });

  it("should return false when headers have different values", () => {
    const headers = new Headers({
      purpose: "navigation",
      "x-purpose": "fetch",
      "x-moz": "reload",
    });
    expect(isPreFetch(headers)).toBe(false);
  });
});
