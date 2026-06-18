import { describe, it, expect } from "vitest";
import { isNonSafeMethod } from "./isNonSafeMethod";

describe("isNonSafeMethod", () => {
  it("returns false for GET", () => {
    expect(isNonSafeMethod({ method: "GET" })).toBe(false);
  });

  it("returns false for HEAD", () => {
    expect(isNonSafeMethod({ method: "HEAD" })).toBe(false);
  });

  it("returns false for lowercase get", () => {
    expect(isNonSafeMethod({ method: "get" })).toBe(false);
  });

  it("returns false for lowercase head", () => {
    expect(isNonSafeMethod({ method: "head" })).toBe(false);
  });

  it("returns true for POST", () => {
    expect(isNonSafeMethod({ method: "POST" })).toBe(true);
  });

  it("returns true for PUT", () => {
    expect(isNonSafeMethod({ method: "PUT" })).toBe(true);
  });

  it("returns true for PATCH", () => {
    expect(isNonSafeMethod({ method: "PATCH" })).toBe(true);
  });

  it("returns true for DELETE", () => {
    expect(isNonSafeMethod({ method: "DELETE" })).toBe(true);
  });

  it("defaults to GET (returns false) when method is undefined", () => {
    expect(isNonSafeMethod({})).toBe(false);
  });
});
