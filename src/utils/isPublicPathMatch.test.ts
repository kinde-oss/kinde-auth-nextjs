import { describe, it, expect } from "vitest";
import { isPublicPathMatch } from "./isPublicPathMatch";

describe("isPublicPathMatch", () => {
  const debugFalse = false;
  const debugTrue = true;

  it("matches exact string path", () => {
    expect(isPublicPathMatch("/foo", ["/foo"], debugFalse)).toBe(true);
    expect(isPublicPathMatch("/foo/bar", ["/foo"], debugFalse)).toBe(true);
    expect(isPublicPathMatch("/foo", ["/bar"], debugFalse)).toBe(false);
  });

  it("matches root path only when exact", () => {
    expect(isPublicPathMatch("/", ["/"], debugFalse)).toBe(true);
    expect(isPublicPathMatch("/foo", ["/"], debugFalse)).toBe(false);
  });

  it("matches RegExp pattern", () => {
    expect(isPublicPathMatch("/api/test", [/^\/api\//], debugFalse)).toBe(true);
    expect(isPublicPathMatch("/api/test", [/^\/foo\//], debugFalse)).toBe(
      false,
    );
  });

  it("handles RegExp with global/sticky flags", () => {
    const re = /foo/g;
    expect(isPublicPathMatch("/foo", [re], debugFalse)).toBe(true);
    // After a match, lastIndex should be reset, so it should match again
    expect(isPublicPathMatch("/foo", [re], debugFalse)).toBe(true);
  });

  it("handles mixed string and RegExp patterns", () => {
    expect(isPublicPathMatch("/foo", ["/bar", /^\/foo/], debugFalse)).toBe(
      true,
    );
    expect(isPublicPathMatch("/baz", ["/bar", /^\/foo/], debugFalse)).toBe(
      false,
    );
  });

  it("returns false on RegExp test error and logs in debug mode", () => {
    // Create a RegExp whose .test method throws
    const badRe = /foo/;
    badRe.test = () => {
      throw new Error("test error");
    };
    const origError = console.error;
    let errorLogged = false;
    console.error = () => {
      errorLogged = true;
    };
    expect(isPublicPathMatch("/foo", [badRe], debugTrue)).toBe(false);
    expect(errorLogged).toBe(true);
    console.error = origError;
  });

  it("returns false on string pattern error", () => {
    // Should not throw, just return false
    expect(
      isPublicPathMatch("/foo", [null as unknown as string], debugFalse),
    ).toBe(false);
  });
});
