import { sessionManager } from "./sessionManager";
import { FlagDataType } from "@kinde-oss/kinde-typescript-sdk";
import { kindeClient } from "./kindeServerClient";
import { getFlag } from "@kinde/js-utils";

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
  (req, res) => async (name, defaultValue, flagType) => {
    try {
      // Fast path: js-utils already handles single namespace selection and value extraction.
      const jsValue = await getFlag(name);
      if (jsValue !== null && jsValue !== undefined) {
        return {
          is_default: false,
          value: jsValue,
          name,
          type: flagType ? FlagDataType[flagType] : null,
          defaultValue,
        };
      }

      // Legacy fallback path retained for backwards compatibility.
      // Single session fetch to avoid duplicate sessionManager calls on fallback path.
      const session = await sessionManager(req, res);
      const tokenFeatureFlags = await kindeClient.getClaimValue(
        session,
        "feature_flags",
        "access_token"
      );
      const tokenHasuraFeatureFlags = await kindeClient.getClaimValue(
        session,
        "x-hasura-feature-flags",
        "access_token"
      );

      const featureFlags = {
        ...tokenFeatureFlags,
        ...tokenHasuraFeatureFlags,
      };

      const flag = featureFlags[name];

      if (!flag && defaultValue === undefined) {
        throw new Error(
          `Flag ${name} was not found, and no default value has been provided`
        );
      }

      if (flag?.t && flagType && flagType !== flag?.t) {
        throw new Error(
          `Flag ${name} is of type ${FlagDataType[flag.t]}, expected type is ${
            FlagDataType[flagType]
          }`
        );
      }

      const isDefault = flag?.v === undefined;
      return {
        is_default: isDefault,
        value: flag?.v === undefined ? defaultValue : flag?.v,
        name,
        type: isDefault ? FlagDataType[flag?.t ?? flagType] : false,
        defaultValue,
      };
    } catch (error) {
      // @ts-ignore
      if (error?.message?.includes("no default value has been provided")) {
        throw error;
      }
      return { value: defaultValue };
    }
  };
