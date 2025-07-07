// utils/isValidEnumValue.ts

/**
 * Generic helper to validate if a value is a valid member of an enum
 * @param enumObj The enum object
 * @param value The value to check
 */
export function isValidEnumValue<T>(
  enumObj: T,
  value: any,
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}
