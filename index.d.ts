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
  last_name: string;
  first_name: string;
  provided_id: string | null;
  preferred_email: string;
};
export type State = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string | undefined;
};
