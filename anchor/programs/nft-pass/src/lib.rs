#![allow(unexpected_cfgs)]
#![allow(deprecated)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("9LXodSGJm8GhbbMyYWSh48YpkRDgFTQSoeezGPtLKJN2");

#[program]
pub mod nft_membership {
    use super::*;

    pub fn create_mint(ctx: Context<CreateMint>, name: String, symbol: String, uri: String, tier: u8, expiry: i64) -> Result<()> {
        create_mint::handler(ctx, name, symbol, uri, tier, expiry)
    }
}
