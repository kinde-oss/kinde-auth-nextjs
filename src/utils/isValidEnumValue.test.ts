import { isValidEnumValue } from "./isValidEnumValue";
import { describe, it, expect } from "vitest";

enum TestEnum {
  FOO = "foo",
  BAR = "bar",
  BAZ = "baz",
}

describe("isValidEnumValue", () => {
  it("returns true for valid enum values (string enum)", () => {
    expect(isValidEnumValue(TestEnum, "foo")).toBe(true);
    expect(isValidEnumValue(TestEnum, "bar")).toBe(true);
    expect(isValidEnumValue(TestEnum, "baz")).toBe(true);
  });

  it("returns false for invalid values (string enum)", () => {
    expect(isValidEnumValue(TestEnum, "qux")).toBe(false);
    expect(isValidEnumValue(TestEnum, "FOO")).toBe(false); // case sensitive
    expect(isValidEnumValue(TestEnum, "")).toBe(false);
    expect(isValidEnumValue(TestEnum, undefined)).toBe(false);
    expect(isValidEnumValue(TestEnum, null)).toBe(false);
  });

  enum NumberEnum {
    ONE = 1,
    TWO = 2,
  }

  it("returns true for valid enum values (number enum)", () => {
    expect(isValidEnumValue(NumberEnum, 1)).toBe(true);
    expect(isValidEnumValue(NumberEnum, 2)).toBe(true);
  });

  it("returns false for invalid values (number enum)", () => {
    expect(isValidEnumValue(NumberEnum, 3)).toBe(false);
    expect(isValidEnumValue(NumberEnum, "1")).toBe(false);
  });
});
