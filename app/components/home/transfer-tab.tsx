import { PublicKey } from "@solana/web3.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { useNFT } from "~/hooks/use-nft";
import { useWallet } from "~/hooks/use-wallet";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/loading-spinner";

export function TransferTab() {
  const wallet = useWallet();
  const { transfer, transaction } = useNFT();

  const [nftAddress, setNFTAddress] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // validate nft address
    if (!nftAddress) {
      newErrors.nftAddress = "NFT address is required";
    }

    // validate recipient address
    if (!recipientAddress) {
      newErrors.recipientAddress = "Recipient address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !wallet.publicKey) return;

    try {
      const result = await transfer({
        mint: new PublicKey(nftAddress),
        to: new PublicKey(recipientAddress),
      });

      if (result.success) {
        // clear
        setNFTAddress("");
        setRecipientAddress("");
        setErrors({});
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer NFT</CardTitle>
        <CardDescription>Transfer your membership pass.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nft-address">NFT Address</Label>
              <Input
                id="nft-address"
                placeholder="Enter NFT address"
                value={nftAddress}
                onChange={(e) => setNFTAddress(e.target.value)}
                className={errors.nftAddress ? "border-red-500" : ""}
              />
              {errors.nftAddress && (
                <p className="text-sm text-red-600">{errors.nftAddress}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient-address">Recipient Address</Label>
              <Input
                id="recipient-address"
                placeholder="Enter recipient address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className={errors.recipientAddress ? "border-red-500" : ""}
              />
              {errors.recipientAddress && (
                <p className="text-sm text-red-600">
                  {errors.recipientAddress}
                </p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full"
          onClick={handleSubmit}
          disabled={!wallet.isConnected || transaction.isLoading}
        >
          {transaction.isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
            </>
          ) : (
            "Transfer"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
