import { useState, useCallback } from "react";
import { Transaction } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { logger } from "~/lib/utils/logger";
import { solanaErrorMapper } from "~/lib/solana/error-mapper";

export interface TransactionState {
  isLoading: boolean;
  signature: string | null;
  error: string | null;
}

export interface TransactionOptions {
  skipConfirmation?: boolean;
}

export function useTransaction() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    signature: null,
    error: null,
  });

  const executeTransaction = useCallback(
    async (
      transasction: Transaction,
      options: TransactionOptions = {}
    ): Promise<string | null> => {
      logger.info("Starting transaction execution");

      if (!wallet.publicKey || !wallet.signTransaction) {
        const error = "Wallet not connected";
        setState({ isLoading: false, signature: null, error });

        return null;
      }

      setState({ isLoading: true, signature: null, error: null });

      try {
        // get latest blockhash
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");
        transasction.recentBlockhash = blockhash;
        transasction.feePayer = wallet.publicKey;

        // sign transaction
        const signedTransaction = await wallet.signTransaction(transasction);

        // send transaction
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          }
        );

        logger.info("Transaction sent with signature", signature);

        setState({
          isLoading: !options.skipConfirmation,
          signature,
          error: null,
        });

        // confirm transaction is not skipped
        if (!options.skipConfirmation) {
          logger.info("⏳ Confirming transaction...");
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash,
              lastValidBlockHeight,
            },
            "confirmed"
          );

          if (confirmation.value.err) {
            logger.error(
              "❌ Transaction confirmation failed:",
              confirmation.value.err
            );
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
          }

          logger.info("✅ Transaction confirmed");

          setState({ isLoading: false, signature, error: null });
        }

        return signature;
      } catch (err) {
        logger.error("Transaction execution failed", err);
        const mappedError =
          err instanceof Error ? solanaErrorMapper(err) : "Transaction failed";
        setState({ isLoading: false, signature: null, error: mappedError });

        throw new Error(mappedError);
      }
    },
    [connection, wallet]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, signature: null, error: null });
  }, []);

  return {
    ...state,
    executeTransaction,
    reset,
  };
}
