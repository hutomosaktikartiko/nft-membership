import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useCallback } from "react";
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../providers/program-provider";
import { useTransaction } from "./use-transaction";
import { getAllNFTPDAs } from "../lib/anchor/pda";
import { useNotification } from "../providers/notification-provider";
import type {
  CreateMintParams,
  NFTOperationResult,
  TransferNFTParams,
} from "../types/nft";
import * as anchor from "@coral-xyz/anchor";
import { logger } from "~/lib/utils/logger";

export function useNFT() {
  const { connection } = useConnection();
  const { program } = useProgram();
  const wallet = useWallet();
  const transaction = useTransaction();
  const notify = useNotification();

  // create mint
  const createMint = useCallback(
    async (params: CreateMintParams): Promise<NFTOperationResult> => {
      if (!program || !wallet.publicKey) {
        return {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
      }

      try {
        const pdas = getAllNFTPDAs(wallet.publicKey);

        const userAta = getAssociatedTokenAddressSync(
          pdas.mint,
          wallet.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const tx = await program.methods
          .createMint(
            params.name,
            params.symbol,
            params.uri,
            params.tier,
            new anchor.BN(params.expiry)
          )
          .accounts({
            user: wallet.publicKey,
            mint: pdas.mint,
            userAta: userAta,
            membership: pdas.membership,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          } as any)
          .transaction();

        const signature = await transaction.executeTransaction(tx);
        if (signature) {
          notify.showTransactionSuccess(
            signature,
            "NFT mint created successfully"
          );
        } else {
          notify.showSuccess(
            "Transaction Submitted",
            "Transaction submitted but no signature returned"
          );
        }

        logger.info("Mint created", params);

        return {
          signature: signature || "",
          success: true,
        };
      } catch (err) {
        logger.error("Failed to create mint", err);
        const error =
          err instanceof Error ? err.message : "Failed to create mint";
        notify.showError("Create Mint Error", error);

        return {
          signature: "",
          success: false,
          error,
        };
      }
    },
    [program, wallet.publicKey, connection, transaction, notify]
  );

  // transfer
  const transfer = useCallback(
    async (params: TransferNFTParams): Promise<NFTOperationResult> => {
      if (!program || !wallet.publicKey) {
        return {
          signature: "",
          success: false,
          error: "Wallet not connected",
        };
      }

      try {
        const fromAta = getAssociatedTokenAddressSync(
          params.mint,
          wallet.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const toAta = getAssociatedTokenAddressSync(
          params.mint,
          params.to,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const tx = new Transaction();

        // add create toAta instruction, if not exists
        const toAtaInfo = await connection.getAccountInfo(toAta);
        if (!toAtaInfo) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              toAta,
              params.to,
              params.mint,
              TOKEN_2022_PROGRAM_ID
            )
          );
        }

        // add transfer instruction
        tx.add(
          createTransferInstruction(
            fromAta,
            toAta,
            wallet.publicKey,
            1,
            [],
            TOKEN_2022_PROGRAM_ID
          )
        );

        const signature = await transaction.executeTransaction(tx);
        if (signature) {
          notify.showTransactionSuccess("Transfer NFT successfully", signature);
        } else {
          notify.showSuccess(
            "Transaction Submitted",
            "Transaction submitted but no signature returned"
          );
        }

        return {
          signature: signature || "",
          success: true,
        };
      } catch (err) {
        logger.error("Failed to transfer nft", err);
        const error =
          err instanceof Error ? err.message : "Failed to transfer NFT";
        notify.showError("Transfer NFT Error", error);

        return {
          signature: "",
          success: false,
          error,
        };
      }
    },
    [program, wallet.publicKey, connection, transaction, notify]
  );

  return {
    createMint,
    transfer,
    transaction,
  };
}
