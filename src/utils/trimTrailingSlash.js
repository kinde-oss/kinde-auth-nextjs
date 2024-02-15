/**
 * 
 * @param {string} str - input string to test 
 * @returns {boolean} 
 */
export const trimTrailingSlash = (str) =>
  str && str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str;