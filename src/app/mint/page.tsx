'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button' // Placeholder
import { ConnectWallet } from '@/components/ConnectWallet'
import { Loader2, Upload } from 'lucide-react'

import { NFT_ADDRESS, NFT_ABI } from '@/config/contracts'

export default function MintPage() {
  const { isConnected } = useAccount()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const uploadToIPFS = async (file: File) => {
    // TODO: Implement actual IPFS upload (e.g., via Pinata API or similar)
    // For now, returning a mock URI
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `ipfs://mock-cid/${file.name}`
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name) return

    try {
      setUploading(true)
      const imageURI = await uploadToIPFS(file)
      const metadata = {
        name,
        description,
        image: imageURI
      }
      // Upload metadata to IPFS...
      const tokenURI = `ipfs://mock-metadata-cid` 
      
      setUploading(false)
      
      writeContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mintNFT',
        args: [tokenURI],
      })
    } catch (error) {
      console.error("Error minting:", error)
      setUploading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Connect Wallet to Mint</h1>
        <ConnectWallet />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mint New NFT</h1>
        <p className="text-gray-400">Create your unique TokenForge NFT on Sepolia.</p>
      </div>

      <form onSubmit={handleMint} className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
        <div className="space-y-2">
          <label className="text-sm font-medium">Image</label>
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="text-sm text-blue-400">{file.name}</div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="e.g. Cosmic Cube #1"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none"
            placeholder="Describe your NFT..."
          />
        </div>

        <button
          type="submit"
          disabled={!file || !name || uploading || isPending || isConfirming}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading to IPFS...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Confirm in Wallet...
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Minting...
            </>
          ) : (
            "Mint NFT"
          )}
        </button>

        {isConfirmed && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm">
            NFT Minted Successfully!
          </div>
        )}
      </form>
    </div>
  )
}
