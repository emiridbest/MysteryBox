import React, { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { celo } from 'viem/chains';
import { createPublicClient, http, formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Award, ChevronDown, ChevronUp, ExternalLink, User, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { mysteryBoxContractAddress, mysteryBoxABI } from "../utils/abi";

interface Claim {
    user: string;
    amount: string;
    timestamp: string;
    transactionHash: string;
    blockNumber: number;
}

interface UserStats {
    totalClaimed: string;
    claimCount: number;
    firstClaim: string;
    lastClaim: string;
    averageClaim: string;
}

interface YearlyStats {
    year: number;
    totalAmount: string;
    claimCount: number;
}

const truncateAddress = (address: string): string => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatAmount = (amount: string): string => {
    return Number(amount).toFixed(4);
};

export default function EnhancedClaimsFooter() {
    const { address } = useAccount();
    const [allClaims, setAllClaims] = useState<Claim[]>([]);
    const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'recent' | 'my-claims' | 'yearly'>('recent');

    // Memoized calculations for connected user
    const userClaims = useMemo(() => {
        if (!address) return [];
        return allClaims.filter(claim =>
            claim.user.toLowerCase() === address.toLowerCase()
        );
    }, [allClaims, address]);

    const userStats = useMemo((): UserStats => {
        if (userClaims.length === 0) {
            return {
                totalClaimed: "0",
                claimCount: 0,
                firstClaim: "",
                lastClaim: "",
                averageClaim: "0"
            };
        }

        const totalClaimed = userClaims.reduce((sum, claim) => sum + parseFloat(claim.amount), 0);
        const sortedClaims = [...userClaims].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

        return {
            totalClaimed: totalClaimed.toFixed(4),
            claimCount: userClaims.length,
            firstClaim: sortedClaims[0]?.timestamp || "",
            lastClaim: sortedClaims[sortedClaims.length - 1]?.timestamp || "",
            averageClaim: (totalClaimed / userClaims.length).toFixed(4)
        };
    }, [userClaims]);


    const totalStats = useMemo(() => {
        const total = recentClaims.reduce((sum, claim) => sum + parseFloat(claim.amount), 0);
        return {
            totalAmount: total.toFixed(4),
            totalClaims: recentClaims.length
        };
    }, [recentClaims]);

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                setIsLoading(true);

                const publicClient = createPublicClient({
                    chain: celo,
                    transport: http(),
                });

                const contractAddress = mysteryBoxContractAddress as `0x${string}`;
                const currentBlockNumber = await publicClient.getBlockNumber();

                // For recent claims (last 7 days) - show for all users
                const oneWeekInBlocks = BigInt(7 * 24 * 60 * 60 / 5); // Assuming 5-second blocks
                const recentFromBlock = currentBlockNumber - oneWeekInBlocks;

                // Get recent claim events for all users
                const recentLogs = await publicClient.getLogs({
                    address: contractAddress,
                    event: {
                        type: 'event',
                        name: 'TokensRequested',
                        inputs: [
                            { type: 'address', name: 'user', indexed: true },
                            { type: 'uint256', name: 'amount' }
                        ]
                    },
                    fromBlock: recentFromBlock,
                    toBlock: currentBlockNumber,
                });

                // Process recent claims
                const recentClaimData: Claim[] = [];
                for (const log of recentLogs) {
                    try {
                        const block = await publicClient.getBlock({ blockHash: log.blockHash });
                        const amount = (log.args.amount?.toString() || "0") as string;

                        recentClaimData.push({
                            user: (log.args.user as string) || "",
                            amount: formatEther(BigInt(amount)),
                            timestamp: block.timestamp.toString(),
                            transactionHash: log.transactionHash,
                            blockNumber: Number(log.blockNumber),
                        });
                    } catch (error) {
                        console.error("Error processing recent log:", error);
                    }
                }

                // Sort recent claims by timestamp (most recent first)
                recentClaimData.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
                setRecentClaims(recentClaimData);

                // For historical data - fetch more extensive history if user is connected
                if (address) {
                    // Get historical data for the connected user (going back further)
                    const historicalBlocks = BigInt(365 * 24 * 60 * 60 / 5); // 1 year
                    const historicalFromBlock = currentBlockNumber > historicalBlocks ?
                        currentBlockNumber - historicalBlocks : BigInt(0);

                    // Get all historical claims for analysis
                    const historicalLogs = await publicClient.getLogs({
                        address: contractAddress,
                        event: {
                            type: 'event',
                            name: 'TokensRequested',
                            inputs: [
                                { type: 'address', name: 'user', indexed: true },
                                { type: 'uint256', name: 'amount' }
                            ]
                        },
                        fromBlock: historicalFromBlock,
                        toBlock: currentBlockNumber,
                    });

                    // Process all historical claims
                    const allClaimData: Claim[] = [];
                    for (const log of historicalLogs) {
                        try {
                            const block = await publicClient.getBlock({ blockHash: log.blockHash });
                            const amount = (log.args.amount?.toString() || "0") as string;

                            allClaimData.push({
                                user: (log.args.user as string) || "",
                                amount: formatEther(BigInt(amount)),
                                timestamp: block.timestamp.toString(),
                                transactionHash: log.transactionHash,
                                blockNumber: Number(log.blockNumber),
                            });
                        } catch (error) {
                            console.error("Error processing historical log:", error);
                        }
                    }

                    setAllClaims(allClaimData);
                }

            } catch (error) {
                console.error('Error fetching claims:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClaims();

        // Refresh claims every 5 minutes
        const intervalId = setInterval(fetchClaims, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [address]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const renderRecentClaims = () => (
        <div className="divide-y divide-white/10">
            <div className="pb-2 mb-3 border-b border-white/10">
                <h4 className="font-semibold text-sm text-white/90">Recent Claims</h4>
            </div>
            {recentClaims.slice(0, 10).map((claim, index) => (
                <div key={`${claim.transactionHash}-${index}`} className="py-2.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${parseFloat(claim.amount) >= 10
                                    ? "bg-gradient-to-br from-yellow-300 to-yellow-500"
                                    : parseFloat(claim.amount) >= 5
                                        ? "bg-gradient-to-br from-blue-300 to-blue-500"
                                        : "bg-gradient-to-br from-purple-300 to-purple-500"
                                }`}>
                                {address && claim.user.toLowerCase() === address.toLowerCase() && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                                )}
                                <span className="font-bold text-xs">
                                    {address && claim.user.toLowerCase() === address.toLowerCase() ? '👤' :
                                        parseFloat(claim.amount) >= 10 ? '🏆' : parseFloat(claim.amount) >= 5 ? '🥈' : '🥉'}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium flex items-center gap-1">
                                    {truncateAddress(claim.user)}
                                    {address && claim.user.toLowerCase() === address.toLowerCase() &&
                                        <span className="text-green-300 text-xs font-semibold">(You)</span>}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-white/70">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(parseInt(claim.timestamp))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{formatAmount(claim.amount)}</span>
                            <span className="text-xs font-medium text-white/70">cUSD</span>
                            <a
                                href={`https://celoscan.io/tx/${claim.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/70 hover:text-white transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderUserClaims = () => {
        if (!address) {
            return (
                <div className="text-center py-6">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-white/50" />
                    <p className="text-white/70">Connect your wallet to view your claim history</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* User Statistics */}
                <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Your Total Claims
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/70 text-xs">Total Claimed</p>
                            <p className="font-bold text-xl text-green-300">{userStats.totalClaimed} cUSD</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/70 text-xs">Total Claims</p>
                            <p className="font-bold text-xl text-blue-300">{userStats.claimCount}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/70 text-xs">Average Claim</p>
                            <p className="font-semibold text-lg">{userStats.averageClaim} cUSD</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/70 text-xs">Member Since</p>
                            <p className="font-semibold text-sm">
                                {userStats.firstClaim ? new Date(parseInt(userStats.firstClaim) * 1000).getFullYear() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent User Claims */}
                {userClaims.length > 0 && (
                    <div>
                        <h5 className="font-medium mb-2 text-sm text-white/90">Your Recent Claims</h5>
                        <div className="divide-y divide-white/10">
                            {userClaims.slice(0, 5).map((claim, index) => (
                                <div key={`user-${claim.transactionHash}-${index}`} className="py-2.5">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center">
                                                <span className="font-bold text-xs">👤</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 text-xs text-white/70">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(parseInt(claim.timestamp))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-lg">{formatAmount(claim.amount)}</span>
                                            <span className="text-xs font-medium text-white/70">cUSD</span>
                                            <a
                                                href={`https://celoscan.io/tx/${claim.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white/70 hover:text-white transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-purple-600/90 border-t border-white/10 shadow-xl z-50 text-white">
            {/* Header bar with summary and toggle */}
            <div
                className="flex items-center justify-between py-2 px-4 cursor-pointer"
                onClick={toggleExpand}
            >
                <div className="flex items-center gap-4">
                    <div className="bg-white/15 backdrop-blur-lg rounded-full p-2">
                        <Award className="h-5 w-5 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Mystery Box Claims</h3>
                        <p className="text-xs text-white/70">
                            {isLoading ? "Loading claims..." :
                                `${totalStats.totalClaims} recent claims • ${totalStats.totalAmount} cUSD` +
                                (address ? ` • Your total: ${userStats.totalClaimed} cUSD (${userStats.claimCount} claims)` : '')
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {address && (
                        <div className="bg-white/15 backdrop-blur-lg rounded-full px-3 py-1 flex items-center gap-1">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-medium">{truncateAddress(address)}</span>
                        </div>
                    )}
                    <button className="bg-white/15 backdrop-blur-lg rounded-full p-1.5 hover:bg-white/25 transition-colors">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Expandable claims list */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {/* Tab Navigation */}
                        <div className="flex border-b border-white/10 px-4">
                            {[
                                { id: 'recent', label: 'Recent (All)', count: recentClaims.length },
                                { id: 'my-claims', label: 'My Claims', count: userClaims.length },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                            ? 'border-white text-white'
                                            : 'border-transparent text-white/70 hover:text-white'
                                        }`}
                                >
                                    {tab.label} {tab.id !== 'my-claims' || address ? `(${tab.count})` : ''}
                                </button>
                            ))}
                        </div>

                        <div className="max-h-96 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin h-8 w-8 border-2 border-white/50 border-t-white rounded-full"></div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'recent' && (
                                        recentClaims.length > 0 ? renderRecentClaims() :
                                            <div className="text-center py-6"><p>No recent claims found</p></div>
                                    )}
                                    {activeTab === 'my-claims' && renderUserClaims()}
                                </>
                            )}
                        </div>

                        <div className="flex justify-center py-2 border-t border-white/10">
                            <a
                                href={`https://celoscan.io/address/${mysteryBoxContractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                            >
                                View all transactions on Celoscan
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}