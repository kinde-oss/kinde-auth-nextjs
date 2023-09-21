import {getFlagFactory} from './getFlag';

export const getIntegerFlagFactory =
  (req, res) => async (code, defaultValue) => {
    try {
      const flag = await getFlagFactory(req, res)(code, defaultValue, 'i');
      return flag.value;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
