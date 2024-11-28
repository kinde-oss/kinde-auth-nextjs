import {
  createKindeServerClient,
  GrantType,
} from "@kinde-oss/kinde-typescript-sdk";
import { config } from "../config/index";

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  config.clientOptions,
);
