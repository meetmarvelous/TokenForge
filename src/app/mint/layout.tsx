import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mint NFT",
  description: "Create your unique TokenForge NFT on Sepolia.",
};

export default function MintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
