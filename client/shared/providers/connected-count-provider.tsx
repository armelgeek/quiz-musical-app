"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { io } from "socket.io-client"

const WS_URL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_PORT || 3000}`
  : ""

type ConnectedCountContextType = {
  count: number
}

const ConnectedCountContext = createContext<ConnectedCountContextType>({ count: 0 })

export function ConnectedCountProvider({ userId, children }: { userId: string, children: ReactNode }) {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const s = io(WS_URL, {
      path: "/ws/notification",
      transports: ["websocket"]
    })
    s.on("connect", () => {
      s.emit("register", userId)
    })
    s.on("connected_count", (c: number) => setCount(c))
    return () => {
      s.disconnect()
    }
  }, [userId])

  return (
    <ConnectedCountContext.Provider value={{ count }}>
      {children}
    </ConnectedCountContext.Provider>
  )
}

export function useConnectedCount() {
  return useContext(ConnectedCountContext)
}
