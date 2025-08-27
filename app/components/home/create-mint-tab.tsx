import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NFTTier } from "~/types/nft";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useNFT } from "~/hooks/use-nft";
import { useWallet } from "~/hooks/use-wallet";
import { useState } from "react";
import { dateToUnixTimestamp } from "~/lib/utils/format";

export function CreateMintTab() {
  const wallet = useWallet();
  const { createMint, transaction } = useNFT();

  const [expiry, setExpiry] = useState<Date>();
  const [tier, setTier] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // validate expiry
    if (!expiry) {
      newErrors.expiry = "Expiry date is required";
    } else if (expiry < new Date()) {
      newErrors.expiry = "Expiry date must in the future";
    }

    // validate tier
    if (!tier) {
      newErrors.tier = "Tier is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !wallet.publicKey) return;

    try {
      const result = await createMint({
        name: "Anchor Membership Pass",
        symbol: "AMP",
        uri: "https://example.com/nft-metadata.json",
        expiry: dateToUnixTimestamp(expiry!),
        tier: Number(tier) as NFTTier,
      });

      if (result.success) {
        // clear
        setExpiry(undefined);
        setTier("");
        setErrors({});
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Mint</CardTitle>
        <CardDescription>
          Create a new mint by filling out the form below.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!expiry}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start font-normal"
                  >
                    <CalendarIcon />
                    {expiry ? (
                      format(expiry, "PPP")
                    ) : (
                      <span>Pick a expiry</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    id="expiry"
                    mode="single"
                    selected={expiry}
                    onSelect={setExpiry}
                  />
                </PopoverContent>
              </Popover>
              {errors.expiry && (
                <p className="text-sm text-red-600">{errors.expiry}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiry">Membership Tier</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start font-normal"
                  >
                    {tier ? `${NFTTier[Number(tier)]}` : "Select Tier"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={tier} onValueChange={setTier}>
                    {Object.entries(NFTTier)
                      .filter(([, value]) => typeof value === "number")
                      .map(([tierName, value]) => (
                        <DropdownMenuRadioItem
                          key={tierName}
                          value={value.toString()}
                        >
                          {tierName}
                        </DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.tier && (
                <p className="text-sm text-red-600">{errors.tier}</p>
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
            "Create Mint"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
