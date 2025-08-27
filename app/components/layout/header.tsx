import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { WalletMultiButton } from "../wallet/wallet-multi-button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="font-bold text-xl hidden sm:block">
              NFT Membership Pass
            </span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Wallet Button - Responsive Size */}
          <div className="hidden sm:block">
            <WalletMultiButton variant="outline" />
          </div>
          <div className="sm:hidden">
            <WalletMultiButton variant="outline" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
