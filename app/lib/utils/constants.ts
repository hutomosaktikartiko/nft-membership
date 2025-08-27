import { clusterApiUrl } from "@solana/web3.js";

export const PROGRAM_ID = "7Q3xJHpmQaxQfHZbDwCY4jRpPjjHNFjTyzX8i4K55Fbb";

/**
 * Network Configuration
 * @returns {Object} network configuration, including network name and RPC endpoint
 */
const getNetworkConfig = () => {
  const customRpcEndpoint = import.meta.env.VITE_RPC_ENDPOINT;
  if (customRpcEndpoint) {
    if (customRpcEndpoint.includes("devnet")) {
      return {
        network: "devnet",
        endpoint: customRpcEndpoint,
      };
    }

    if (customRpcEndpoint.includes("mainnet")) {
      return {
        network: "mainnet-beta",
        endpoint: customRpcEndpoint,
      };
    }

    if (
      customRpcEndpoint.includes("localhost") ||
      customRpcEndpoint.includes("127.0.0.1")
    ) {
      return {
        network: "testnet",
        endpoint: customRpcEndpoint,
      };
    }

    // default for custom endpoint
    return {
      network: "custom",
      endpoint: customRpcEndpoint,
    };
  }

  // default based on mode
  if (import.meta.env.MODE === "production") {
    return {
      network: "mainnet-beta",
      endpoint: customRpcEndpoint,
    };
  }

  // defaault to test network for development
  return {
    network: "testnet",
    endpoint: "http://localhost:8899",
  };
};

const { network, endpoint } = getNetworkConfig();
export const NETWORK = network;
export const RPC_ENPOINT = endpoint;

/// PDA seeds
export const SEEDS = {
  MINT: "mint",
  MEMBERSHIP: "membership",
} as const;

/// Toast duration
export const TOAST_DURATION = 5000; // 5s

/// Transaction confirmation timeout
export const TX_CONFIRMATION_TIMEOUT = 60000; // 60s
