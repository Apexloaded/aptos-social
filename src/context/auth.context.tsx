'use client';

import useCreator from '@/hooks/creator.hook';
import { UserInterface } from '@/interfaces/user.interface';
import { UseQueryResult } from '@tanstack/react-query';
import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export type AuthContextType = {
  logout: () => void;
  user?: UserInterface;
  findCreator: (username: string) => UseQueryResult<UserInterface, Error>;
  //   profileProgress?: number;
  //   setProfileProgress: Dispatch<SetStateAction<number | undefined>>;
  //   isAuth: boolean;
};

interface Props {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: Props) {
  const creator = useCreator();

  return (
    <AuthContext.Provider
      value={{
        ...creator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
