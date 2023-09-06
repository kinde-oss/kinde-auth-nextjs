import {cookies} from 'next/headers';
import {sessionManager} from '../sessionManager';
import {kindeClient} from './kindeServerClient';

export const getFlag = (code, defaultValue, flagType) => {
  try {
    const flag = kindeClient.getFlag(
      sessionManager(cookies()),
      code,
      defaultValue,
      flagType
    );

    return flag;
  } catch (error) {
    if (error.message.includes('no default value has been provided')) {
      throw error;
    }
    return defaultValue;
  }
};
