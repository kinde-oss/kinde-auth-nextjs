import {getFlag} from './getFlag';

export const getBooleanFlag = async (code, defaultValue) => {
  try {
    const flag = await getFlag(code, defaultValue, 'b');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
