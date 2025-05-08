import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthTempContextValue {
  email: string;
  password: string;
  setTempAuth: (email: string, password: string) => void;
  clearTempAuth: () => void;
}

const AuthTempContext = createContext<AuthTempContextValue | undefined>(
  undefined
);

export const AuthTempProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setTempAuth = (newEmail: string, newPassword: string) => {
    setEmail(newEmail);
    setPassword(newPassword);
  };

  const clearTempAuth = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <AuthTempContext.Provider
      value={{ email, password, setTempAuth, clearTempAuth }}
    >
      {children}
    </AuthTempContext.Provider>
  );
};

export const useAuthTemp = () => {
  const ctx = useContext(AuthTempContext);
  if (!ctx) throw new Error("useAuthTemp must be used within AuthTempProvider");
  return ctx;
};
