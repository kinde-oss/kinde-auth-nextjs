import {getClaim} from './getClaim';

const flagDataTypeMap = {
  s: 'string',
  i: 'integer',
  b: 'boolean'
};

export const getFlag = (code, defaultValue, flagType) => {
  const flags = getClaim('feature_flags');
  const flag = flags && flags[code] ? flags[code] : {};

  if (!flag.v && defaultValue == undefined) {
    throw Error(
      `Flag ${code} was not found, and no default value has been provided`
    );
  }

  if (flagType && flag.t && flagType !== flag.t) {
    throw Error(
      `Flag ${code} is of type ${flagDataTypeMap[flag.t]} - requested type ${
        flagDataTypeMap[flagType]
      }`
    );
  }
  return {
    code,
    type: flagDataTypeMap[flag.t || flagType],
    value: flag.v == null ? defaultValue : flag.v,
    is_default: flag.v == null
  };
};
