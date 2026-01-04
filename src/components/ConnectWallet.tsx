'use client'

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/button' // We'll create a simple button component or use standard HTML for now if UI lib not fully set up
import { useState, useEffect } from 'react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-gray-200">
          {ensName ? `${ensName} (${address?.slice(0, 6)}...${address?.slice(-4)})` : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </div>
        <button
          onClick={() => disconnect()}
          className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
    >
      Connect Wallet
    </button>
  )
}
