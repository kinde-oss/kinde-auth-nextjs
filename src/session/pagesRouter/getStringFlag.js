import {getFlag} from './getFlag';

export const getStringFlag = (code, defaultValue) => {
  try {
    const flag = getFlag(code, defaultValue, 's');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
