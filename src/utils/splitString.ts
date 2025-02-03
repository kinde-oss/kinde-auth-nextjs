export const splitString = (str: string, length: number): string[] => {
  if (length <= 0) {
    return [];
  }
  return str.match(new RegExp(`.{1,${length}}`, "g")) || [];
};
