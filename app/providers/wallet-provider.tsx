import { useMemo } from "react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { RPC_ENPOINT } from "~/lib/utils/constants";
import { useNotification } from "./notification-provider";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const notify = useNotification();

  // supported wallets
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENPOINT}>
      <SolanaWalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={(error) => {
          notify.showError(
            "Wallet Error",
            error.message ? error.message : error.toString()
          );
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
