#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("7Q3xJHpmQaxQfHZbDwCY4jRpPjjHNFjTyzX8i4K55Fbb");

#[program]
pub mod nft_pass {
    use super::*;

    pub fn create_mint(ctx: Context<CreateMint>, name: String, symbol: String, uri: String, tier: u8, expiry: i64) -> Result<()> {
        create_mint::handler(ctx, name, symbol, uri, tier, expiry)
    }
}
