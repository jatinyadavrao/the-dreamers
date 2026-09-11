"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

export type AuthUser = { email: string; name: string } | null;

type Ctx = {
  user: AuthUser;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  isSignedIn: false,
  signOut: async () => {},
});

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ user: initialUser, isSignedIn: !!initialUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
