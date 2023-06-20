import {getFlag} from './getFlag';

export const getIntegerFlag = (code, defaultValue) => {
  try {
    const flag = getFlag(code, defaultValue, 'i');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
