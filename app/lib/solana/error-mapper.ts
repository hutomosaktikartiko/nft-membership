export function solanaErrorMapper(error: Error): string {
  const message = error.message.toLowerCase();

  // wallet not connected
  if (message.includes("wallet not connected")) {
    return "Please connect your wallet first";
  }

  // program error
  if (message.includes("custom program error: 0x0")) {
    return "Program execution failed - account may already exist";
  }

  // program not deployed
  if (
    message.includes("program that does not exist") ||
    message.includes("attempt to load a program")
  ) {
    return "Program not found - please ensure it's deployed to the correct network";
  }

  // insufficient funds
  if (
    message.includes("insufficient funds") ||
    message.includes("debit an account")
  ) {
    return "Insufficient funds to complete the transaction";
  }

  // account already in use
  if (message.includes("already in use")) {
    return "This NFT tier has alread been created for your wallet";
  }

  // account not found
  if (message.includes("account not found") || message.includes("0x3")) {
    return "Required account not found";
  }

  // invalid account data
  if (message.includes("invalidaccountdata")) {
    return "Invalid account data provided";
  }

  // nft non-transferable
  if (message.includes("account is frozen")) {
    return "This NFT is not transferable";
  }

  // simulation failed
  if (message.includes("simulation failed")) {
    return "Transaction simulation failed - please check your inputs";
  }

  // default fallback
  return "Transaction failed - please try again";
}
