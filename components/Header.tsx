"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
  // Token addresses
  const USDC_ADDRESS = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const USDT_ADDRESS = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";
  
  // State
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [cusdBalance, setCusdBalance] = useState<number>(0);
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [celoBalance, setCeloBalance] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isFarcasterContext, setIsFarcasterContext] = useState(false);
  
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

  // Check if running in Farcaster context
  useEffect(() => {
    const checkFarcasterContext = () => {
      // Check for Farcaster-specific properties
      const isFarcaster = !!(
        window.farcaster || 
        window.parent !== window || 
        document.referrer.includes('warpcast') ||
        window.location.href.includes('farcaster') ||
        navigator.userAgent.includes('Farcaster')
      );
      
      setIsFarcasterContext(isFarcaster);
      
      if (!isFarcaster) {
        console.warn('This app is designed to run only within Farcaster');
        // Optionally show a message to the user
        toast.warning('This app is designed for Farcaster. Some features may not work properly.');
      }
    };

    checkFarcasterContext();
  }, []);

  // Contract read hooks
  const cusdResult = useReadContract({
    abi: stableTokenABI,
    address: CUSD_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
    query: { enabled: !!address && isConnected }
  });

  const usdcResult = useReadContract({
    abi: stableTokenABI,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
    query: { enabled: !!address && isConnected }
  });

  const usdtResult = useReadContract({
    abi: stableTokenABI,
    address: USDT_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
    query: { enabled: !!address && isConnected }
  });

  // Handle Farcaster-specific connection
  const handleFarcasterConnect = async () => {
    try {
      if (!isFarcasterContext) {
        toast.error('Connection only available in Farcaster');
        return;
      }

      // Look for Farcaster-specific connector first
      const farcasterConnector = connectors.find((c) => 
        c.id === "miniAppConnector" || 
        c.name?.toLowerCase().includes('farcaster') ||
        c.id === "farcaster"
      );
      
      const connector = farcasterConnector || connectors[0];
      
      if (!connector) {
        toast.error('No suitable wallet connector found');
        return;
      }

      toast.info("Connecting to wallet...");
      
      // Ensure we're on Celo network
      if (chainId !== celoChainId) {
        await switchChain({ chainId: celoChainId });
      }
      
      await connect({ 
        connector, 
        chainId: celoChainId 
      });
      
      toast.success("Connected successfully!");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: celoChainId });
  }, [switchChain, celoChainId]);
  // Auto-connect and network switching for Farcaster
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


  // Fetch balances
  useEffect(() => {
    if (isConnected && address && isFarcasterContext) {
      const fetchCeloBalance = async () => {
        try {
          const balance = await publicClient.getBalance({ address });
          setCeloBalance(Number(balance));
        } catch (error) {
          console.error("Error fetching CELO balance:", error);
        }
      };

      // Update token balances from hook results
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
    usdtResult.data,
    isFarcasterContext
  ]);

  // Click outside handler for dropdown
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

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format balance for display
  const formatBalance = (balance: number, decimals: number = 18) => {
    return (balance / Math.pow(10, decimals)).toFixed(4);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-purple-200  shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
           
            <span className="ml-2 font-bold text-lg text-purple-600 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Mystery Box</span>
          </div>

          {/* Connection Status & Controls */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
               
                {/* Mobile View */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Bars3Icon className="h-5 w-5 text-purple-700" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px]">
                      <div className="flex flex-col space-y-4 mt-8">
                        {/* Wallet Info */}
                        <div className="bg-purple-800 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-white/70 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {address ? address.substring(2, 4).toUpperCase() : ''}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formatAddress(address)}</p>
                              <p className="text-xs text-purple-500">Connected</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>CELO:</span>
                              <span className="font-medium">{formatBalance(celoBalance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CUSD:</span>
                              <span className="font-medium">{formatBalance(cusdBalance)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Navigation */}
                        <Link
                          href="/"
                          className={cn(
                            "py-3 px-4 rounded-lg transition-all duration-300 text-center",
                            pathname === "/"
                              ? "bg-purple text-white"
                              : "hover:bg-purple-100 bg-purple-800"
                          )}
                        >
                          Home
                        </Link>
                        
                        {/* Disconnect Button */}
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => disconnect()}
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <Button
                className="rounded-full bg-purple-900 font-medium "
                onClick={handleFarcasterConnect}
                disabled={!isFarcasterContext}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

declare global {
  interface Window {
    farcaster?: any;
  }
}