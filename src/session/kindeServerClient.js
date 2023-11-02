import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {config} from '../config/index';

/** @type {import('../../types').KindeClient} */
export const kindeClient = createKindeServerClient(
  config.grantType,
  config.clientOptions
);
