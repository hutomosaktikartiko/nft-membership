/**
 * Convert date to unix timestamp
 * @param date selected date
 * @returns Date in unix timestamp
 */
export function dateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Format PublicKey to shortened address
 * @param address solana account address
 * @param length showing characters
 * @returns sliced address
 */
export function formatAddress(address: string, length = 4): string {
  if (!address) return "";
  if (address.length <= length * 2) return address;

  return `${address.slice(0, length)}...${address.slice(-length)}`;
}
