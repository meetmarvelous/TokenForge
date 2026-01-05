'use client'

import { useEffect, useState } from 'react'
import { useAccount, usePublicClient, useReadContract } from 'wagmi'
import { parseAbiItem } from 'viem'
import { ConnectWallet } from '@/components/ConnectWallet'
import { NFTCard } from '@/components/NFTCard'
import { NFT_ADDRESS, NFT_ABI, MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '@/config/contracts'

interface NFT {
  tokenId: bigint
  tokenURI: string
  owner: string
  metadata?: {
    name: string
    description: string
    image: string
  }
  listing?: {
    price: bigint
    seller: string
    active: boolean
  }
}

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !publicClient) return
      setIsLoading(true)

      try {
        // Strategy: Scan Token IDs 1 to 50 (or until failure) to find owned tokens.
        // This avoids "Log response size exceeded" errors from RPCs with strict limits.
        const MAX_SCAN = 50
        const tokenIdsToCheck = Array.from({ length: MAX_SCAN }, (_, i) => BigInt(i + 1))

        // 1. Check ownership of tokens 1..50
        const ownershipResults = await publicClient.multicall({
          contracts: tokenIdsToCheck.map(id => ({
            address: NFT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'ownerOf',
            args: [id]
          })),
          allowFailure: true
        })

        const ownedTokenIds: bigint[] = []

        ownershipResults.forEach((result, index) => {
          if (result.status === 'success' && (result.result as string).toLowerCase() === address.toLowerCase()) {
            ownedTokenIds.push(tokenIdsToCheck[index])
          }
        })

        // 2. Fetch details for each owned token
        const loadedNFTs = await Promise.all(ownedTokenIds.map(async (tokenId) => {
          // Fetch Token URI
          const tokenURI = await publicClient.readContract({
            address: NFT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'tokenURI',
            args: [tokenId]
          })

          // Fetch Listing Status
          const listing = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: 'listings',
            args: [NFT_ADDRESS, tokenId]
          })

          // Fetch Metadata (IPFS)
          let metadata = { name: `Token #${tokenId}`, description: 'Loading...', image: '' }
          try {
            // Helper to try multiple gateways
            const fetchMetadata = async (uri: string) => {
              if (!uri.startsWith('ipfs://')) return null
              
              const cid = uri.replace('ipfs://', '')
              const gateways = [
                `https://ipfs.io/ipfs/${cid}`,
                `https://dweb.link/ipfs/${cid}`,
                `https://gateway.pinata.cloud/ipfs/${cid}`
              ]

              for (const gateway of gateways) {
                try {
                  const res = await fetch(gateway)
                  if (res.ok) {
                    const contentType = res.headers.get('content-type')
                    if (contentType && contentType.includes('application/json')) {
                      return await res.json()
                    }
                  }
                } catch (e) {
                  // Try next gateway
                }
              }
              throw new Error('Failed to fetch metadata from all gateways')
            }

            const json = await fetchMetadata(tokenURI)
            
            if (json) {
              metadata = {
                name: json.name || `Token #${tokenId}`,
                description: json.description || '',
                image: json.image || ''
              }
            } else {
               // If fetch failed (e.g. mock URI), keep default "Loading..." or set to "Unknown"
               metadata.description = 'Metadata unavailable'
            }
          } catch (e) {
            console.warn('Error fetching metadata for', tokenId, e)
            metadata.description = 'Metadata unavailable'
          }

          return {
            tokenId,
            tokenURI,
            owner: address,
            metadata,
            listing: listing[2] ? { // listing.active
              seller: listing[0],
              price: listing[1],
              active: listing[2]
            } : undefined
          } as NFT
        }))

        setNfts(loadedNFTs)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isConnected) {
      fetchNFTs()
    }
  }, [address, isConnected, publicClient])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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

      {isLoading ? (
        <div className="text-center py-20">Loading your NFTs...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              No NFTs found. <a href="/mint" className="text-blue-400 hover:underline">Mint one now!</a>
            </div>
          ) : (
            nfts.map((nft) => (
              <NFTCard
                key={nft.tokenId.toString()}
                tokenId={nft.tokenId}
                name={nft.metadata?.name || `Token #${nft.tokenId}`}
                description={nft.metadata?.description || ''}
                imageURI={nft.metadata?.image || ''}
                owner={nft.owner}
                price={nft.listing?.active ? nft.listing.price : undefined}
                isListed={nft.listing?.active}
                seller={nft.listing?.seller}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
