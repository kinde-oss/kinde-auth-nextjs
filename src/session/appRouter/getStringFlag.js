import {getFlag} from './getFlag';

export const getStringFlag = async (code, defaultValue) => {
  try {
    const flag = await getFlag(code, defaultValue, 's');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
