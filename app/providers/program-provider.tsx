import * as anchor from "@coral-xyz/anchor";
import type { NftPass } from "../lib/anchor/idl";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createProgram, createReadOnlyProgram } from "~/lib/anchor/client";

interface ProgramContextType {
  program: anchor.Program<NftPass> | null;
  readOnlyProgram: anchor.Program<NftPass>;
  isLoading: boolean;
  error: string | null;
}

const ProgramContext = createContext<ProgramContextType | null>(null);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [program, setProgram] = useState<anchor.Program<NftPass> | null>(null);
  const [readOnlyProgram, setReadOnlyProgram] =
    useState<anchor.Program<NftPass> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // initialize read-only program (always available)
  useEffect(() => {
    if (connection) {
      const roProgram = createReadOnlyProgram(connection);
      setReadOnlyProgram(roProgram);
    }
  }, [connection]);

  // initialize program with wallet (when connected)
  useEffect(() => {
    if (connection && wallet.publicKey) {
      const prog = createProgram(connection, wallet);
      setProgram(prog);
    } else {
      setProgram(null);
    }
  }, [connection, wallet.publicKey]);

  const value: ProgramContextType = {
    program,
    readOnlyProgram: readOnlyProgram!,
    isLoading,
    error,
  };

  return (
    <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error("useProgram must be used within a ProgramProvider");
  }

  return context;
}
