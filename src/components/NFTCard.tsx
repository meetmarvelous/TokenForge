'use client'

import { useState, useEffect } from 'react'

import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button' // Placeholder
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

interface NFTCardProps {
  tokenId: bigint
  price?: bigint
  seller?: string
  owner?: string
  imageURI: string
  name: string
  description: string
  isListed?: boolean
  onBuy?: () => void
  onCancel?: () => void
  onList?: () => void
  isProcessing?: boolean
}

export function NFTCard({
  tokenId,
  price,
  seller,
  owner,
  imageURI,
  name,
  description,
  isListed,
  onBuy,
  onCancel,
  onList,
  isProcessing
}: NFTCardProps) {
  // Helper to format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Gateways to try in order
  const GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.io/ipfs/'
  ]

  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0)
  const [imgSrc, setImgSrc] = useState('')
  const [hasError, setHasError] = useState(false)

  // Initialize image source
  useEffect(() => {
    if (!imageURI) {
      setImgSrc('')
      return
    }

    if (imageURI.startsWith('ipfs://')) {
      const cid = imageURI.replace('ipfs://', '')
      setImgSrc(`${GATEWAYS[0]}${cid}`)
      setCurrentGatewayIndex(0)
      setHasError(false)
    } else {
      setImgSrc(imageURI)
    }
  }, [imageURI])

  const handleImageError = () => {
    if (imageURI.startsWith('ipfs://')) {
      const nextIndex = currentGatewayIndex + 1
      if (nextIndex < GATEWAYS.length) {
        const cid = imageURI.replace('ipfs://', '')
        setImgSrc(`${GATEWAYS[nextIndex]}${cid}`)
        setCurrentGatewayIndex(nextIndex)
      } else {
        setHasError(true)
      }
    } else {
      setHasError(true)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all group">
      <div className="aspect-square relative bg-black/20 flex items-center justify-center">
        {/* In a real app, use Next.js Image with a proper loader or external domain config */}
        {imgSrc && !hasError ? (
          <img 
            src={imgSrc} 
            alt={name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-gray-500 text-sm flex flex-col items-center gap-2">
            <span className="text-2xl">🖼️</span>
            <span>No Image</span>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg truncate">{name}</h3>
          <p className="text-sm text-gray-400 truncate">{description}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          {isListed ? (
            <div className="space-y-1">
              <div className="text-gray-400">Price</div>
              <div className="font-mono font-bold text-blue-400">
                {price ? formatEther(price) : '0'} ETH
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-gray-400">Owner</div>
              <div className="font-mono text-gray-300">
                {owner ? formatAddress(owner) : 'Unknown'}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          {isListed ? (
            seller === owner ? ( // If viewing own listing
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Listing"}
              </button>
            ) : (
              <button
                onClick={onBuy}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy Now"}
              </button>
            )
          ) : (
            <button
              onClick={onList}
              disabled={isProcessing}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "List for Sale"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
