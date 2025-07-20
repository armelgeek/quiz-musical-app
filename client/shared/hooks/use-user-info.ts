import { useMemo } from "react"
import { authClient } from "@/shared/lib/config/auth-client"

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  rank?: string;
  level?: number;
  xp?: number;
}

export interface UserInfoResult {
  user: User | null;
  isLoading: boolean;
  error: unknown;
}

export function useUserInfo(): UserInfoResult {
  const { data, isPending, error } = authClient.useSession();
  const user = useMemo(() => {
    if (data && typeof data === 'object' && 'user' in data) {
      return data.user as User;
    }
    return null;
  }, [data]);
  return {
    user,
    isLoading: isPending,
    error
  };
}

export type UserInfo = ReturnType<typeof useUserInfo>;