import type { PublicKey } from "@solana/web3.js";

export enum NFTTier {
  Bronze = 1,
  Silver = 2,
  Gold = 3,
}

export interface NFT {
  tier: NFTTier;
  expiry: number;
  mint: PublicKey;
  bump: number;
  owner: PublicKey;
  uri: string;
  name: string;
  symbol: string;
}

export interface CreateMintParams {
  name: string;
  symbol: string;
  uri: string;
  tier: NFTTier;
  expiry: number;
}

export interface TransferNFTParams {
  mint: PublicKey;
  to: PublicKey;
}

export interface NFTOperationResult {
  signature: string;
  success: boolean;
  error?: string;
}
