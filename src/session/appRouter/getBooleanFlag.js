import {getFlag} from './getFlag';

export const getBooleanFlag = (request, code, defaultValue) => {
  try {
    const flag = getFlag(request, code, defaultValue, 'b');
    return flag.value;
  } catch (err) {
    console.error(err);
  }
};
