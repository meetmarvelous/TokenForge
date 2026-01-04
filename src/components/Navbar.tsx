'use client'

import Link from 'next/link'
import { ConnectWallet } from './ConnectWallet'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Hexagon } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Marketplace', href: '/' },
    { name: 'Mint', href: '/mint' },
    { name: 'Dashboard', href: '/dashboard' },
  ]

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
          <span>TokenForge</span>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  pathname === item.href ? "text-white" : "text-gray-400"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  )
}
