import { NETWORK } from "../utils/constants";

/**
 * Get explorer url
 * @param signature transaction signature
 * @param type transaction or address
 * @returns full explorer url
 */
export function getExplorerUrl(
  signature: string,
  type: "tx" | "address" = "tx"
): string {
  const cluster = NETWORK === "mainnet-beta" ? "" : `?cluster=${NETWORK}`;

  return `https://explorer.solana.com/${type}/${signature}${cluster}`;
}
