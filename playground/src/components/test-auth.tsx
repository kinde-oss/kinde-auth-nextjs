"use client";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect } from "react";

export default function TestAuth() {
  const { getRoles, isAuthenticated } = useKindeAuth();
  useEffect(() => {
    if (isAuthenticated) {
      const printRoles = async () => {
        const roles = await getRoles();
        console.log(roles);
      };
      printRoles();
    }
  }, [isAuthenticated, getRoles]);
  return <div>test-auth</div>;
}
