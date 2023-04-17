import React from "react";

export declare function useKindeAuth(): State;

export declare function KindeProvider({
  children,
}: {
  children: any;
}): React.Provider<State>;

export declare function handleAuth(): any;

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
  updated_at: string | null;
  picture: string | null;
};

export type State = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string | undefined;
};

export type KindePermissions = {
  permissions: string[];
  orgCode: string;
};

export type KindePermission = {
  isGranted: boolean;
  orgCode: string;
};

export type KindeFlagTypeCode = "b" | "i" | "s";

export type KindeFlagTypeValue = "boolean" | "integer" | "string";

export type KindeFlag = {
  code: string;
  type: KindeFlagTypeValue | null;
  value: any;
  defaultValue: any | null;
  is_default: boolean;
};

export type KindeOrganization = {
  orgCode: string;
};

export type KindeOrganizations = {
  orgCodes: string[];
};
