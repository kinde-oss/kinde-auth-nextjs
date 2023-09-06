import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {config} from '../../config/index';
import {sessionManager} from '../sessionManager';

export const getFlag = (code, defaultValue, flagType) => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

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
