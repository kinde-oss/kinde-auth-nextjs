import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {config} from '../config/index';

export const kindeClient = createKindeServerClient(
  config.grantType,
  config.clientOptions
);
