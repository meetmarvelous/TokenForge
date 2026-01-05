'use client'

import { useEffect, useState } from 'react'
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi'
import { parseAbiItem, parseEther, formatEther } from 'viem'
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
  const { writeContractAsync } = useWriteContract()
  
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState<bigint | null>(null)

  // Fetch NFTs (Logic unchanged, just wrapped in function for refreshing)
  const fetchNFTs = async () => {
    if (!address || !publicClient) return
    setIsLoading(true)

    try {
      const MAX_SCAN = 50
      const tokenIdsToCheck = Array.from({ length: MAX_SCAN }, (_, i) => BigInt(i + 1))

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

      const loadedNFTs = await Promise.all(ownedTokenIds.map(async (tokenId) => {
        const tokenURI = await publicClient.readContract({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId]
        })

        const listing = await publicClient.readContract({
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
          owner: address,
          metadata,
          listing: listing[2] ? {
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

  useEffect(() => {
    if (isConnected) {
      fetchNFTs()
    }
  }, [address, isConnected, publicClient])

  const handleList = async (tokenId: bigint) => {
    const priceStr = window.prompt("Enter price in ETH (e.g. 0.01):")
    if (!priceStr) return
    
    try {
      setProcessingId(tokenId)
      const price = parseEther(priceStr)

      // 1. Check Approval
      const isApproved = await publicClient?.readContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'isApprovedForAll',
        args: [address!, MARKETPLACE_ADDRESS]
      })

      if (!isApproved) {
        console.log("Approving marketplace...")
        const hash = await writeContractAsync({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'setApprovalForAll',
          args: [MARKETPLACE_ADDRESS, true]
        })
        await publicClient?.waitForTransactionReceipt({ hash })
        console.log("Approved!")
      }

      // 2. List Item
      console.log("Listing item...")
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listItem',
        args: [NFT_ADDRESS, tokenId, price]
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      console.log("Listed!")
      
      await fetchNFTs()
    } catch (error) {
      console.error("Error listing:", error)
      alert("Failed to list item. See console for details.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (tokenId: bigint) => {
    if (!confirm("Are you sure you want to cancel this listing?")) return

    try {
      setProcessingId(tokenId)
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [NFT_ADDRESS, tokenId]
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await fetchNFTs()
    } catch (error) {
      console.error("Error canceling:", error)
      alert("Failed to cancel listing.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleBuy = async (tokenId: bigint, price: bigint) => {
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
      await fetchNFTs()
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
                onList={() => handleList(nft.tokenId)}
                onCancel={() => handleCancel(nft.tokenId)}
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
