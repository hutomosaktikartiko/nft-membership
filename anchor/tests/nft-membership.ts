import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NftMembership } from "../target/types/nft_membership";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("NFT Membership Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.NftMembership as Program<NftMembership>;

  let from: Keypair;
  let to: Keypair;

  let mintPda: PublicKey;
  let membershipPda: PublicKey;
  let metadataPda: PublicKey;
  let masterEditionPda: PublicKey;

  let fromAtaSync: PublicKey;
  let toAtaSync: PublicKey;

  const name = "Anchor Membership";
  const symbol = "AMP";
  const uri = "https://example.com/nft-metadata.json";
  const tier = 1;
  const expiry = new anchor.BN(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days from now

  before(async () => {
    // generate keypairs
    from = Keypair.generate();
    to = Keypair.generate();

    // airdrop sol
    await Promise.all([
      provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(from.publicKey, 2_000_000_000)
      ),
      provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(to.publicKey, 2_000_000_000)
      ),
    ]);

    [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), from.publicKey.toBuffer()],
      program.programId
    );
    [membershipPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("membership"),
        from.publicKey.toBuffer(),
        mintPda.toBuffer(),
      ],
      program.programId
    );
    [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPda.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    [masterEditionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPda.toBuffer(),
        Buffer.from("edition"),
      ],
      METADATA_PROGRAM_ID
    );

    // users's ata
    fromAtaSync = getAssociatedTokenAddressSync(
      mintPda,
      from.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    toAtaSync = getAssociatedTokenAddressSync(
      mintPda,
      to.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
  });

  it("Create Mint - Successfully mint a NFT", async () => {
    try {
      const tx = await program.methods
        .createMint(name, symbol, uri, tier, expiry)
        .accounts({
          user: from.publicKey,
          mint: mintPda,
          userAta: fromAtaSync,
          metadata: metadataPda,
          membership: membershipPda,
          masterEdition: masterEditionPda,
          sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          metadataProgram: METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([from])
        .rpc();

      console.log("Mint created successfully:", tx);

      const membershipInfo = await program.account.membership.fetch(
        membershipPda
      );
      expect(membershipInfo.tier).to.equal(tier);
      expect(membershipInfo.owner.toString()).to.equal(
        from.publicKey.toString()
      );
    } catch (error) {
      console.error("Error creating mint:", error);
      throw error;
    }
  });
  describe("Error Handling & Edge Cases", () => {
    it("Create Mint - Fails when creating duplicate mint", async () => {
      try {
        const tx = await program.methods
          .createMint(name, symbol, uri, tier, expiry)
          .accounts({
            user: from.publicKey,
            mint: mintPda,
            userAta: fromAtaSync,
            metadata: metadataPda,
            membership: membershipPda,
            masterEdition: masterEditionPda,
            sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            metadataProgram: METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([from])
          .rpc();

        console.log("Mint created successfully:", tx);
      } catch (error) {
        expect(error.message).to.include("already in use");
        console.log("Correctly rejected duplicate mint creation");
      }
    });

    it("Transfer - Fails to transfer NFT (souldbound)", async () => {
      const fromAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        from,
        mintPda,
        from.publicKey,
        false,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      const toAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        to,
        mintPda,
        to.publicKey,
        false,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      try {
        const tx = await program.provider.sendAndConfirm(
          new Transaction().add(
            createTransferInstruction(
              fromAta.address,
              toAta.address,
              from.publicKey,
              1,
              [],
              TOKEN_2022_PROGRAM_ID
            )
          ),
          [from]
        );

        expect.fail("Transfer should have failed but succeeded");
      } catch (error) {
        console.log("Transfer failed as expected:", error.message);
        expect(error.message.toLowerCase()).to.include("account is frozen");
      }
    });
  });
});
