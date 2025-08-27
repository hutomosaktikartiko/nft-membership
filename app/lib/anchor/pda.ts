import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SEEDS } from "../utils/constants";
import { Buffer } from "buffer";

/**
 * Derive mint PDA
 * @param user wallet public key
 * @returns PDA and bump
 */
export function getMintPDA(user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.MINT), user.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}

/**
 * Derive membership PDA
 * @param user wallet public key
 * @param mint mint public key
 * @returns PDA and bump
 */
export function getMembershipPDA(
  user: PublicKey,
  mint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.MEMBERSHIP), user.toBuffer(), mint.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}

export function getAllNFTPDAs(user: PublicKey) {
  const [mint, mintBump] = getMintPDA(user);
  const [membership, membershipBump] = getMembershipPDA(user, mint);

  return {
    mint,
    membership,
    bumps: {
      mintBump,
      membershipBump,
    },
  };
}
