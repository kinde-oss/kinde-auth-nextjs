import {getFlagFactory} from './getFlag';

export const getStringFlagFactory =
  (req, res) => async (code, defaultValue) => {
    try {
      const flag = await getFlagFactory(req, res)(code, defaultValue, 's');
      return flag.value;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
