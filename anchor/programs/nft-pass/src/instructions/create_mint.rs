use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{
        mint_to, set_authority, freeze_account, spl_token_2022::instruction::AuthorityType, MintTo, SetAuthority, FreezeAccount,
        Token2022,
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
        mint::authority = user, // temporary authority
        mint::freeze_authority = user, // temporary freeze authority
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

    #[account(
        init,
        payer = user,
        space = 8 + Membership::INIT_SPACE,
        seeds = [b"membership", user.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub membership: Account<'info, Membership>,

    /// Program & Sysvars accounts
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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

    // 1) set membership account
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

    // 3) Store metadata in membership account
    membership.name = name;
    membership.symbol = symbol;
    membership.uri = uri;

    // 4) Freeze the token account to make it non-transferable
    let freeze_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        FreezeAccount {
            account: ctx.accounts.user_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    freeze_account(freeze_ctx)?;

    // 5) lock mint by removing authorities
    // remove MintTokens authority
    let cpi_ctx_mint = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        SetAuthority {
            account_or_mint: ctx.accounts.mint.to_account_info(),
            current_authority: ctx.accounts.user.to_account_info(),
        },
    );
    set_authority(cpi_ctx_mint, AuthorityType::MintTokens, None)?;

    // remove FreezeAccount authority
    let cpi_ctx_freeze = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        SetAuthority {
            account_or_mint: ctx.accounts.mint.to_account_info(),
            current_authority: ctx.accounts.user.to_account_info(),
        },
    );
    set_authority(cpi_ctx_freeze, AuthorityType::FreezeAccount, None)?;

    Ok(())
}
