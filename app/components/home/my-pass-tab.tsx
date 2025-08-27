import { useNFTs } from "~/hooks/use-nfts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatAddress } from "~/lib/utils/format";
import { CopyButton } from "../ui/copy-button";
import { LoadingSpinner } from "../ui/loading-spinner";

export function MyPassTab() {
  const { nfts, isLoading, error } = useNFTs();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Pass</CardTitle>
        <CardDescription>See you membership pass here.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Loaded */}
        {nfts && (
          <div className="gap-4">
            {nfts.map((nft, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{nft.name}</CardTitle>
                  <CardDescription>Tier: {nft.tier}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-gray-600">Address:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono break-all">
                      {formatAddress(nft.mint.toBase58())}
                    </span>
                    <CopyButton text={nft.mint.toBase58()} size="sm" />
                  </div>
                  <img src={nft.uri} alt={nft.name} className="w-full" />
                  <p className="mt-2">
                    Expiry: {new Date(nft.expiry * 1000).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
