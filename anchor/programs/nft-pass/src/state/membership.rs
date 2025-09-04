use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Membership {
    pub owner: Pubkey,
    pub tier: u8,
    pub expiry: i64,
    pub bump: u8,
}
