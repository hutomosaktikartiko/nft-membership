import * as anchor from "@coral-xyz/anchor";
const { AnchorProvider } = anchor;
import { Connection, PublicKey } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { IDL } from "./idl";
import type { NftPass } from "./idl";

/**
 * Create anchor program instance
 * @param connection network connection
 * @param wallet wallet context state
 * @returns anchor program instance or null
 */
export function createProgram(
  connection: Connection,
  wallet: WalletContextState
): anchor.Program<NftPass> | null {
  if (!wallet.publicKey) {
    return null;
  }

  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  return new anchor.Program<NftPass>(IDL as any, provider);
}

/**
 * Get program with read-only provider (no wallet required)
 * @param connection network connection
 * @returns anchor program instance
 */
export function createReadOnlyProgram(
  connection: Connection
): anchor.Program<NftPass> {
  // create a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: new PublicKey("11111111111111111111111111111111"),
    signTransaction: async () => {
      throw new Error("Read-only wallet");
    },
    signAllTransaction: async () => {
      throw new Error("Read-only wallet");
    },
  };

  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: "confirmed",
  });

  return new anchor.Program<NftPass>(IDL as NftPass, provider);
}
