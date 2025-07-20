"use client"
import { useConnectedCount } from "../../providers/connected-count-provider"

export default function ConnectedCount() {
  const { count } = useConnectedCount()
  return (
    <div>
      <span>Utilisateurs connectés : {count}</span>
    </div>
  )
}
