'use client'

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { useState, useEffect } from 'react'
import { X, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
          onClick={() => {
            disconnect()
            console.log("Disconnected wallet")
          }}
          className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1b1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    console.log("Attempting to connect with:", connector.name, connector.id)
                    connect({ connector }, {
                      onError: (error) => {
                        console.error("Connection failed:", error)
                        alert(`Connection failed: ${error.message}`)
                      },
                      onSuccess: () => {
                        console.log("Connection successful")
                        setIsOpen(false)
                      }
                    })
                  }}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 rounded-lg transition-all group"
                >
                  <span className="font-medium text-sm text-gray-200 group-hover:text-white">
                    {connector.name}
                  </span>
                  {connector.name.toLowerCase().includes('metamask') && (
                    <div className="w-6 h-6 relative">
                       <svg viewBox="0 0 32 32" className="w-full h-full">
                         <path fill="#E17726" d="M29.2 10.7L26.5 1.6l-3.3 11.2-1.1 3.7 5.6-2.9 1.5-2.9zM2.8 10.7l2.7-9.1 3.3 11.2 1.1 3.7-5.6-2.9-1.5-2.9z"/>
                         <path fill="#E27625" d="M26.5 1.6L22.2 8.3l-2.6-2.1L26.5 1.6zM5.5 1.6l4.3 6.7 2.6-2.1L5.5 1.6z"/>
                         <path fill="#E27625" d="M9.8 6.2l-2.6 2.1 3.2 10.8L9.8 6.2zM22.2 6.2l2.6 2.1-3.2 10.8 2.6-10.8z"/>
                       </svg>
                    </div>
                  )}
                  {connector.name.toLowerCase().includes('phantom') && (
                     <div className="w-6 h-6 relative flex items-center justify-center bg-[#AB9FF2] rounded-full">
                        <span className="text-xs font-bold text-white">Ph</span>
                     </div>
                  )}
                </button>
              ))}
            </div>
            <div className="p-3 bg-black/20 text-center border-t border-white/5">
              <p className="text-[10px] text-gray-500">
                By connecting, you agree to Terms.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
