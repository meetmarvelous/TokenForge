'use client'

import Link from 'next/link'
import { Github, Linkedin, Globe, Hexagon } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
              <span>TokenForge</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The next generation of digital asset creation and trading. Built on Sepolia testnet.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">Marketplace</Link>
              </li>
              <li>
                <Link href="/mint" className="hover:text-blue-400 transition-colors">Mint NFT</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">About System</Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Technology</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Next.js 14</li>
              <li>Tailwind CSS</li>
              <li>Wagmi & Viem</li>
              <li>Solidity</li>
              <li>IPFS / Pinata</li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com/meetmarvelous" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-blue-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/meetmarvelous" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://bio.link/meetmarvelous" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-blue-400 transition-colors"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Created by Marvelous
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TokenForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
