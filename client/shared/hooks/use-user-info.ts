import { useMemo } from "react"
import { authClient } from "@/shared/lib/config/auth-client"
export function useUserInfo() {
    const { data, isPending, error } = authClient.useSession()
    const user = useMemo(() => data as unknown | null || null, [data]);
    return {
        user: user && typeof user === "object" && "user" in user ? (user as { user: unknown }).user : null,
        isLoading: isPending,
        error
    }
}
export type UserInfo = ReturnType<typeof useUserInfo>;