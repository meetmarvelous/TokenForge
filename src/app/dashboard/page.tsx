'use client'

import { useAccount } from 'wagmi'
import { ConnectWallet } from '@/components/ConnectWallet'

export default function DashboardPage() {
  const { isConnected, address } = useAccount()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Connect Wallet to View Dashboard</h1>
        <ConnectWallet />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-gray-400">Manage your NFTs and listings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Placeholder for user's NFTs */}
        <div className="col-span-full text-center py-20 text-gray-500">
          No NFTs found. <a href="/mint" className="text-blue-400 hover:underline">Mint one now!</a>
        </div>
      </div>
    </div>
  )
}
