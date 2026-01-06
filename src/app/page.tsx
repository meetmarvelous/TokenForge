import { Metadata } from 'next'
import { Marketplace } from '@/components/Marketplace'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Discover and collect extraordinary NFTs.',
}

export default function MarketplacePage() {
  return <Marketplace />
}
