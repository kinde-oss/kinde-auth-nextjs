import {getFlag} from './getFlag';

export const getBooleanFlag = (code, defaultValue) => {
  try {
    const flag = getFlag(code, defaultValue, 'b');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
