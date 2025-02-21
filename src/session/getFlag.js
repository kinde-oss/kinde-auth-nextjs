import { sessionManager } from "./sessionManager";
import { kindeClient } from "./kindeServerClient";
import { FlagDataType } from "@kinde-oss/kinde-typescript-sdk";

/**
 * @callback getFlag
 * @param {string} code
 * @param {boolean | number | string} defaultValue
 * @param {import('../../types').KindeFlagTypeCode} flagType
 * @returns {Promise<import('../../types').KindeFlag | {value: boolean | number | string}>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getFlag}
 */
export const getFlagFactory =
  (req, res) => async (code, defaultValue, flagType) => {
    try {
      const flags = {
        ...(await getClaimValue(
          sessionManager,
          "feature_flags",
          "access_token",
        )),
        ...(await getClaimValue(
          sessionManager,
          "x-hasura-feature-flags",
          "access_token",
        )),
      };

      const flag = featureFlags[code];

      if (!flag && defaultValue === undefined) {
        throw new Error(
          `Flag ${code} was not found, and no default value has been provided`,
        );
      }

      if (flag?.t && type && type !== flag?.t) {
        throw new Error(
          `Flag ${code} is of type ${FlagDataType[flag.t]}, expected type is ${
            FlagDataType[type]
          }`,
        );
      }

      const response = {
        is_default: flag?.v === undefined,
        value: flag?.v ?? defaultValue,
        code,
      };

      if (!response.is_default) {
        response.type = FlagDataType[flag?.t ?? type];
      }

      return flag;
    } catch (error) {
      // @ts-ignore
      if (error.message.includes("no default value has been provided")) {
        throw error;
      }
      return { value: defaultValue };
    }
  };
