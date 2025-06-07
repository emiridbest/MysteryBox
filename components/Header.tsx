"use client";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useConnect,
  useAccount,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useChainId
} from "wagmi";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "../components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { config } from "./providers/WagmiProvider";
import { stableTokenABI } from "@celo/abis";
import { toast } from "sonner";

export default function Header() {
  const USDC_ADDRESS = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const USDT_ADDRESS = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";
  const [usdcBalance, setUsdcBalance] = useState<Number>(0);
  const [cusdBalance, setCusdBalance] = useState<Number>(0);
  const [usdtBalance, setUsdtBalance] = useState<Number>(0);
  const [celoBalance, setCeloBalance] = useState<Number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const celoChainId = config.chains[0].id;
  const publicClient = usePublicClient({ chainId: celoChainId });
  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const chainId = useChainId();

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: celoChainId });
  }, [switchChain, celoChainId]);

  // Move hooks to the component level so they're called unconditionally
  const cusdResult = useReadContract({
    abi: stableTokenABI,
    address: CUSD_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
  });

  const usdcResult = useReadContract({
    abi: stableTokenABI,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
  });

  const usdtResult = useReadContract({
    abi: stableTokenABI,
    address: USDT_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
  });

  useEffect(() => {
    const switchToCelo = async () => {
      if (!isConnected || isConnected && chainId !== celoChainId) {
        try {
          toast.info("Switching to Celo network...");
          handleSwitchChain();
          await new Promise(resolve => setTimeout(resolve, 3000));
          if (chainId == celoChainId) {
            const connector = connectors.find((c) => c.id === "miniAppConnector") || connectors[0];
            connect({
              connector,
              chainId: celoChainId,
            });
            toast.success("Connected to Celo network successfully!");
          } else {
            throw new Error("Failed to switch to Celo network");
          }
        } catch (error) {
          console.error("Connection error:", error);
        }
      }
    };

    switchToCelo();
  }, [connect, connectors, chainId, celoChainId, handleSwitchChain, isConnected]);


  useEffect(() => {
    if (isConnected && address) {
      const fetchCeloBalance = async () => {
        try {
          const balance = await publicClient.getBalance({ address });
          setCeloBalance(Number(balance));
        } catch (error) {
          console.error("Error fetching CELO balance:", error);
        }
      };

      // Update balances from hook results
      if (cusdResult.data) {
        setCusdBalance(Number(cusdResult.data));
      }

      if (usdcResult.data) {
        setUsdcBalance(Number(usdcResult.data));
      }

      if (usdtResult.data) {
        setUsdtBalance(Number(usdtResult.data));
      }
      fetchCeloBalance();
    }
  }, [
    isConnected,
    address,
    publicClient,
    cusdResult.data,
    usdcResult.data,
    usdtResult.data
  ]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);




  // Function to format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                className="cursor-pointer transition-all duration-300 hover:scale-105"
                src="/esusu.png"
                width="120"
                height="120"
                alt="EsusuLogo"
                onClick={() => router.push('/')}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>

              </NavigationMenu>
            </div>

            {/* Connected User Section */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full px-4 border-gray-200 hover:border-primary/80 flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                        <span className="text-white text-xs">
                          {address ? address.substring(2, 4).toUpperCase() : ''}
                        </span>
                      </div>
                      <span className="font-medium text-sm">{formatAddress(address as string)}</span>
                      <ChevronDownIcon className="h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-card" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center justify-between hover:bg-primary/10 hover:text-primary"
                        onClick={() => disconnect()}
                      >
                        <span>Disconnect</span>
                        <XMarkIcon className="h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="cursor-pointer flex items-center justify-between hover:bg-primary/10 hover:text-primary"
                  onClick={() => {
                    const connector = connectors.find((c) => c.id === "miniAppConnector") || connectors[0];
                    connect({ connector, chainId: celoChainId });
                  }}
                >
                  Connect
                </Button>
              )}

              {/* Mobile menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-black/80 dark:text-primary hover:bg-primary/10">
                      <Bars3Icon className="color-black/50 h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="glass-card w-[80%]">
                    <div className="flex flex-col space-y-4 mt-8 dark:text-gray-500">
                      {/* Connected Status for Mobile */}
                      <div className="flex items-center space-x-3 py-3 px-4 mb-2 bg-primary/10 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                          <span className="text-white">
                            {address ? address.substring(2, 4).toUpperCase() : ''}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Connected Wallet
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatAddress(address as string)}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              {`CELO: ${celoBalance ? (Number(celoBalance) / 1e18).toFixed(4) : '0.0000'}`}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              {`CUSD: ${cusdBalance ? (Number(cusdBalance) / 1e18).toFixed(4) : '0.0000'}`}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              {`USDC: ${usdcBalance ? (Number(usdcBalance) / 1e18).toFixed(4) : '0.0000'}`}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              {`USDT: ${usdtBalance ? (Number(usdtBalance) / 1e18).toFixed(4) : '0.0000'}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/"
                        className={cn(
                          "py-2 px-4 rounded-lg transition-all duration-300",
                          pathname === "/"
                            ? "text-black/90 dark:bg-primary/10 dark:text-primary border-l-2 border-primary"
                            : "hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        Home
                      </Link>

                      {/* Rest of mobile menu remains the same */}


                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          About Us
                        </h3>
                        <div className="mt-2 pl-4">
                         
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}


          {/* Desktop Navigation */}

          <Button
            className="hidden md:flex rounded-full bg-primary hover:bg-primary/90 font-medium shadow-md"
            onClick={() => {
              const connector = connectors.find((c) => c.id === "miniAppConnector") || connectors[0];
              connect({ connector, chainId: celoChainId });
            }}
          >
            Connect
          </Button>

        </div>
      </div>
    </header>
  );
}

declare global {
  interface Window {
    ethereum: any;
    farcaster: any;
  }
}