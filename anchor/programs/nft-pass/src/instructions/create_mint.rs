use crate::{constants::*, state::*, MEMBERSHIP_SEED};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        Metadata,
        mpl_token_metadata::{
            instructions::CreateV1CpiBuilder,
            types::{TokenStandard, PrintSupply}
        }
    },
    token_2022::{
        mint_to, freeze_account,
        MintTo, FreezeAccount, Token2022,
    },
    token_interface::{Mint, TokenAccount},
};

#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// PDA mint account
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = user,
        mint::freeze_authority = user,
        mint::token_program = token_program,
        seeds = [b"mint", user.key().as_ref()], // TODO: Add tier on seeds
        bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    /// Temporary user's token account, not re-use
    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_ata: InterfaceAccount<'info, TokenAccount>,

    /// Metaplex metadata account
    #[account(
        mut,
        seeds = [
            METADATA_SEED.as_bytes(),
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub metadata: UncheckedAccount<'info>,

    /// Master edition account
    #[account(
        mut,
        seeds = [
            METADATA_SEED.as_bytes(),
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            EDITION_SEED.as_bytes(),
        ],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub master_edition: UncheckedAccount<'info>,

    /// Custom membership account
    #[account(
        init,
        payer = user,
        space = 8 + Membership::INIT_SPACE,
        seeds = [MEMBERSHIP_SEED.as_bytes(), user.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub membership: Account<'info, Membership>,

    /// Program & Sysvars accounts
    pub sysvar_instructions: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateMint>,
    name: String,
    symbol: String,
    uri: String,
    tier: u8,
    expiry: i64,
) -> Result<()> {
    let mint = &ctx.accounts.mint;
    let user = &ctx.accounts.user;
    let membership = &mut ctx.accounts.membership;

    // 1) store metadata in membership account
    membership.tier = tier;
    membership.expiry = expiry;
    membership.owner = user.key();
    membership.bump = ctx.bumps.membership;

    // 2) mint token to user's ATA (amount = 1)
    let mint_to_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: mint.to_account_info(),
            to: ctx.accounts.user_ata.to_account_info(),
            authority: user.to_account_info(),
        },
    );
    mint_to(mint_to_ctx, 1)?;

    // 3) freeze the token account to make it non-transferable
    let freeze_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        FreezeAccount {
            account: ctx.accounts.user_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    freeze_account(freeze_ctx)?;

    // 4) create metaplex metadata account
    CreateV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .metadata(&ctx.accounts.metadata)
        .master_edition(Some(&ctx.accounts.master_edition))
        .mint(&ctx.accounts.mint.to_account_info(), false)
        .authority(&ctx.accounts.user)
        .payer(&ctx.accounts.user)
        .update_authority(&ctx.accounts.user, false)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(Some(&ctx.accounts.token_program))
        .token_standard(TokenStandard::NonFungible)
        .print_supply(PrintSupply::Zero)
        .seller_fee_basis_points(0)
        .name(name)
        .symbol(symbol)
        .uri(uri)
        .decimals(0)
        .invoke()?;

    Ok(())
}
