"use client";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect } from "react";

export default function TestAuth() {
  const { getRoles, isAuthenticated } = useKindeAuth();
  const printRoles = async () => {
    const roles = await getRoles();
    console.log(roles);
  };
  useEffect(() => {
    if (isAuthenticated) {
      printRoles();
    }
  }, [isAuthenticated]);
  return <div>test-auth</div>;
}
