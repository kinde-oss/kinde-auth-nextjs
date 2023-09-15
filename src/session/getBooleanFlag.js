import {getFlagFactory} from './getFlag';

export const getBooleanFlagFactory =
  (req, res) => async (code, defaultValue) => {
    try {
      const flag = await getFlagFactory(req, res)(code, defaultValue, 'b');
      return flag.value;
    } catch (err) {
      console.error(err);
    }
  };
