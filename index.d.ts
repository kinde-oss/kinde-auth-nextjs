import React from "react";

export function useKindeAuth(): State;
export function KindeProvider({
  children,
}: {
  children: any;
}): React.Provider<State>;
export function handleAuth(): any;
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
  updated_at: string | null;
};
export type State = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string | undefined;
};
