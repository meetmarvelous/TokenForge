import type { Metadata } from "next";
import { Hexagon, ShieldCheck, Zap, Globe, Code, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: "About System",
  description: "Learn about the technology behind TokenForge.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <div className="flex justify-center mb-6">
          <Hexagon className="w-20 h-20 text-blue-500 fill-blue-500/20 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          The Technology Behind TokenForge
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          A decentralized NFT marketplace built on the Sepolia testnet, leveraging modern web technologies and blockchain innovation.
        </p>
      </div>

      {/* Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">Blockchain Layer</h2>
          <p className="text-gray-400 leading-relaxed">
            Built on the <strong>Sepolia Ethereum Testnet</strong> for secure and cost-free testing. 
            Smart contracts are written in <strong>Solidity</strong> to handle NFT minting (ERC-721) and marketplace logic (listing, buying, canceling).
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 hover:border-purple-500/50 transition-colors">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold">Decentralized Storage</h2>
          <p className="text-gray-400 leading-relaxed">
            All NFT assets (images and metadata) are stored on <strong>IPFS</strong> (InterPlanetary File System) via <strong>Pinata</strong>. 
            This ensures that your digital assets are immutable, permanent, and truly decentralized.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 hover:border-green-500/50 transition-colors">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold">Frontend Performance</h2>
          <p className="text-gray-400 leading-relaxed">
            Powered by <strong>Next.js 14</strong> (App Router) for server-side rendering and optimal performance. 
            Styled with <strong>Tailwind CSS</strong> for a responsive, modern, and dark-mode-first design system.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 hover:border-orange-500/50 transition-colors">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Code className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold">Web3 Integration</h2>
          <p className="text-gray-400 leading-relaxed">
            Seamless wallet connection using <strong>Wagmi</strong> and <strong>Viem</strong>. 
            Supports real-time interaction with smart contracts, ensuring a smooth user experience for signing transactions and reading blockchain state.
          </p>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6">
        <div className="inline-flex p-3 bg-white/5 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold">Security First</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Smart contracts are designed with security best practices, including reentrancy guards and ownership controls. 
          The frontend implements strict type safety with TypeScript to prevent runtime errors.
        </p>
      </div>
    </div>
  );
}
