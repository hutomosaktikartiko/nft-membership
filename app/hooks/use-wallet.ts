import {
  useWallet as useSolanaWallet,
  useConnection,
} from "@solana/wallet-adapter-react";

export function useWallet() {
  const wallet = useSolanaWallet();
  const { connection } = useConnection();

  return {
    ...wallet,
    isConnected: wallet.connected && !!wallet.publicKey,
  };
}
