import {getFlag} from './getFlag';

export const getIntegerFlag = async (code, defaultValue) => {
  try {
    const flag = await getFlag(code, defaultValue, 'i');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
