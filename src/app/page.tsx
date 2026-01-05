'use client'

import { useReadContract } from 'wagmi'
import { useState } from 'react'
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '@/config/contracts'

export default function MarketplacePage() {
  // TODO: Fetch listings from contract
  // Since we don't have an indexer (The Graph), we might need to rely on events or a simple loop if the contract supports it.
  // Our contract has a mapping but no enumerable list of active listings.
  // We should probably add an event listener or a view function to get listings if possible, 
  // or just hardcode some for demo if we can't easily fetch all.
  // Ideally, we'd use The Graph, but that's out of scope for "simple".
  // We can add a "getAllListings" function to the contract or just show "No listings found" for now.
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="flex gap-2">
          {/* Filters could go here */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Placeholder for NFT Cards */}
        <div className="col-span-full text-center py-20 text-gray-500">
          No items listed yet.
        </div>
      </div>
    </div>
  )
}
