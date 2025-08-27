use anchor_lang::prelude::*;

#[error_code]
pub enum AppError {
    #[msg("Custom error message")]
    CustomError,
}
