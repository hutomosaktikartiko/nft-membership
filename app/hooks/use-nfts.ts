import { useProgram } from "~/providers/program-provider";
import { NFTTier, type NFT } from "~/types/nft";
import { useWallet } from "./use-wallet";
import { useCallback, useEffect, useState } from "react";
import { useNotification } from "~/providers/notification-provider";
import { logger } from "~/lib/utils/logger";
import { getMintPDA } from "~/lib/anchor/pda";
import { PublicKey } from "@solana/web3.js";

export interface NFTsState {
  nfts: NFT[];
  isLoading: boolean;
  error: string | null;
}

export function useNFTs() {
  const { readOnlyProgram } = useProgram();
  const wallet = useWallet();
  const notify = useNotification();

  const [state, setState] = useState<NFTsState>({
    nfts: [],
    isLoading: false,
    error: null,
  });

  // fetch all NFTs for current wallet
  const fetchNFTs = useCallback(async () => {
    if (!wallet.publicKey || !readOnlyProgram) {
      setState((prev) => ({
        ...prev,
        nfts: [],
        error: null,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const tiers = Object.values(NFTTier).filter(
        (tier) => typeof tier === "number"
      ) as number[];

      const userNFTs: NFT[] = [];

      for (const tier of tiers) {
        // derive mint PDA
        const [mintPda] = getMintPDA(wallet.publicKey);

        // derive membership PDA
        const [membershipPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("membership"),
            wallet.publicKey!.toBuffer(),
            mintPda.toBuffer(),
          ],
          readOnlyProgram.programId
        );

        const membershipAccount =
          await readOnlyProgram.account.membership.fetchNullable(membershipPda);

        if (membershipAccount && membershipAccount.tier === tier) {
          userNFTs.push({
            tier: membershipAccount.tier,
            expiry: membershipAccount.expiry.toNumber(),
            mint: mintPda,
            name: membershipAccount.name,
            symbol: membershipAccount.symbol,
            uri: membershipAccount.uri,
            owner: membershipAccount.owner,
            bump: membershipAccount.bump,
          });
          break;
        }
      }

      setState((prev) => ({
        ...prev,
        nfts: userNFTs,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      logger.error("Error fetching NFTs: ", err);
      const error = err instanceof Error ? err.message : "Failed to fetch NFTs";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      notify.showError("Fetch NFTs Error", error);
    }
  }, [wallet.publicKey, readOnlyProgram]);

  // auto fetch when wallet changed
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return {
    ...state,
    fetchNFTs,
  };
}
