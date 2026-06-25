import type { GetServerSideProps } from "next";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

type Props = {
  isAuthenticated: boolean;
  userName: string | null;
};

export default function Home({ isAuthenticated, userName }: Props) {
  return (
    <div>
      <h1>Kinde Pages Router Playground</h1>
      {isAuthenticated ? (
        <>
          <p>Welcome, {userName}!</p>
          <LogoutLink>Log out</LogoutLink>
        </>
      ) : (
        <>
          <LoginLink>Sign in</LoginLink>
          <RegisterLink>Sign up</RegisterLink>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { isAuthenticated, getUser } = getKindeServerSession(
    req as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;

  return {
    props: {
      isAuthenticated: authenticated,
      userName: user
        ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim()
        : null,
    },
  };
};
