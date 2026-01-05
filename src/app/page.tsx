'use client'

import { useEffect, useState } from 'react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { formatEther } from 'viem'
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

export default function MarketplacePage() {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  
  const [listings, setListings] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState<bigint | null>(null)

  const fetchListings = async () => {
    if (!publicClient) return
    setIsLoading(true)

    try {
      // Scan Token IDs 1 to 50
      const MAX_SCAN = 50
      const tokenIdsToCheck = Array.from({ length: MAX_SCAN }, (_, i) => BigInt(i + 1))

      // 1. Fetch Listing Status for ALL tokens
      const listingResults = await publicClient.multicall({
        contracts: tokenIdsToCheck.map(id => ({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: 'listings',
          args: [NFT_ADDRESS, id]
        })),
        allowFailure: true
      })

      const activeTokenIds: bigint[] = []
      
      // Filter for active listings
      listingResults.forEach((result, index) => {
        if (result.status === 'success') {
          const listing = result.result as [string, bigint, boolean]
          // listing[2] is 'active' boolean
          if (listing && listing[2] === true) {
            activeTokenIds.push(tokenIdsToCheck[index])
          }
        }
      })

      // 2. Fetch details for active listings
      const loadedListings = await Promise.all(activeTokenIds.map(async (tokenId) => {
        const tokenURI = await publicClient.readContract({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId]
        })

        const owner = await publicClient.readContract({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'ownerOf',
          args: [tokenId]
        })

        const listingData = await publicClient.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: 'listings',
          args: [NFT_ADDRESS, tokenId]
        })

        let metadata = { name: `Token #${tokenId}`, description: 'Loading...', image: '' }
        try {
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
                  if (contentType && contentType.includes('application/json')) return await res.json()
                }
              } catch (e) {}
            }
            throw new Error('Failed to fetch metadata')
          }

          const json = await fetchMetadata(tokenURI)
          if (json) {
            metadata = {
              name: json.name || `Token #${tokenId}`,
              description: json.description || '',
              image: json.image || ''
            }
          } else {
             metadata.description = 'Metadata unavailable'
          }
        } catch (e) {
          metadata.description = 'Metadata unavailable'
        }

        return {
          tokenId,
          tokenURI,
          owner,
          metadata,
          listing: {
            seller: listingData[0],
            price: listingData[1],
            active: listingData[2]
          }
        } as NFT
      }))

      setListings(loadedListings)
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [publicClient])

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    if (!isConnected) {
      alert("Please connect your wallet to buy.")
      return
    }
    if (!confirm(`Buy this NFT for ${formatEther(price)} ETH?`)) return

    try {
      setProcessingId(tokenId)
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyItem',
        args: [NFT_ADDRESS, tokenId],
        value: price
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await fetchListings()
    } catch (error) {
      console.error("Error buying:", error)
      alert("Failed to buy item.")
    } finally {
      setProcessingId(null)
    }
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-400">Discover and collect extraordinary NFTs.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading marketplace...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              No items listed yet.
            </div>
          ) : (
            listings.map((nft) => (
              <NFTCard
                key={nft.tokenId.toString()}
                tokenId={nft.tokenId}
                name={nft.metadata?.name || `Token #${nft.tokenId}`}
                description={nft.metadata?.description || ''}
                imageURI={nft.metadata?.image || ''}
                owner={nft.owner}
                price={nft.listing?.price}
                isListed={true}
                seller={nft.listing?.seller}
                onBuy={() => nft.listing && handleBuy(nft.tokenId, nft.listing.price)}
                isProcessing={processingId === nft.tokenId}
                accountAddress={address}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
