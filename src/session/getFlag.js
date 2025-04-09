import { sessionManager } from "./sessionManager";
import { FlagDataType } from "@kinde-oss/kinde-typescript-sdk";
import { kindeClient } from "./kindeServerClient";

/**
 * @callback getFlag
 * @param {string} code
 * @param {boolean | number | string} defaultValue
 * @param {import('../types').KindeFlagTypeCode} flagType
 * @returns {Promise<import('../types').KindeFlag | {value: boolean | number | string}>}
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
      const tokenFeatureFlags = await kindeClient.getClaimValue(
        await sessionManager(req, res),
        "feature_flags",
        "access_token",
      );
      const tokenHasuraFeatureFlags = await kindeClient.getClaimValue(
        await sessionManager(req, res),
        "x-hasura-feature-flags",
        "access_token",
      );

      const featureFlags = {
        ...tokenFeatureFlags,
        ...tokenHasuraFeatureFlags,
      };

      const flag = featureFlags[code];

      if (!flag && defaultValue === undefined) {
        throw new Error(
          `Flag ${code} was not found, and no default value has been provided`,
        );
      }

      if (flag?.t && flagType && flagType !== flag?.t) {
        throw new Error(
          `Flag ${code} is of type ${FlagDataType[flag.t]}, expected type is ${
            FlagDataType[flagType]
          }`,
        );
      }

      const isDefault = flag?.v === undefined;
      const response = {
        is_default: isDefault,
        value: flag?.v === undefined ? defaultValue : flag?.v,
        code,
        type: isDefault ? FlagDataType[flag?.t ?? flagType] : false,
        defaultValue,
      };

      return response;
    } catch (error) {
      // @ts-ignore
      if (error.message.includes("no default value has been provided")) {
        throw error;
      }
      return { value: defaultValue };
    }
  };
