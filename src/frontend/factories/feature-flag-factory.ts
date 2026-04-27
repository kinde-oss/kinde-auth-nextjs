import { config } from "../../config";
import {
  KindeFlag,
  KindeFlagRaw,
  KindeFlagTypeCode,
  KindeFlagTypeValue,
} from "../../types";
import { KindeFeatureFlags } from "../types";

/** @type {Record<KindeFlagTypeCode, KindeFlagTypeValue>} */
export const flagDataTypeMap: Record<KindeFlagTypeCode, KindeFlagTypeValue> = {
  s: "string",
  i: "integer",
  b: "boolean",
  j: "json",
};

export const getFlagFactory = (featureFlags: KindeFeatureFlags) => {
  return (
    code: string,
    defaultValue: string | number | boolean,
    flagType: KindeFlagTypeCode,
  ): KindeFlag => {
    const flags = featureFlags || {};
    const flag = flags && flags[code] ? flags[code] : null;

    if (!flag && defaultValue === undefined) {
      throw Error(
        `Flag ${code} was not found, and no default value has been provided`,
      );
    }

    if (flagType && flag?.t && flagType !== flag?.t) {
      throw Error(
        `Flag ${code} is of type ${flagDataTypeMap[flag.t]} - requested type ${
          flagDataTypeMap[flagType]
        }`,
      );
    }
    return {
      code,
      type: flagDataTypeMap[flag?.t || flagType],
      value: flag?.v == null ? defaultValue : flag?.v,
      is_default: flag?.v == null,
      defaultValue: defaultValue,
    };
  };
};

export const getBooleanFlagFactory = (featureFlags: KindeFeatureFlags) => {
  return (code: string, defaultValue: boolean) => {
    try {
      const flag = getFlagFactory(featureFlags)(code, defaultValue, "b");
      return flag.value;
    } catch (error) {
      if (config.isDebugMode) {
        console.error(error);
      }
    }
  };
};

export const getStringFlagFactory = (featureFlags: KindeFeatureFlags) => {
  return (code: string, defaultValue: string) => {
    try {
      const flag = getFlagFactory(featureFlags)(code, defaultValue, "s");
      return flag.value;
    } catch (error) {
      if (config.isDebugMode) {
        console.error(error);
      }
    }
  };
};

export const getIntegerFlagFactory = (featureFlags: KindeFeatureFlags) => {
  return (code: string, defaultValue: number) => {
    try {
      const flag = getFlagFactory(featureFlags)(code, defaultValue, "i");
      return flag.value;
    } catch (error) {
      if (config.isDebugMode) {
        console.error(error);
      }
    }
  };
};
