"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Sparkles, Star, Heart, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ethers, Interface } from 'ethers';
import { useAccount, useSendTransaction, useSwitchChain, useChainId } from 'wagmi';
import { readContract } from '@wagmi/core';
import { parseEther } from 'viem';
import { config } from '../../components/providers/WagmiProvider';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { mysteryBoxContractAddress, mysteryBoxABI } from "../../utils/abi";
import { getDataSuffix, submitReferral } from '@divvi/referral-sdk'
import { TransactionSteps, Step, StepStatus } from '../../components/TransactionSteps';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "../../components/ui/dialog";
// Divvi Integration 
const dataSuffix = getDataSuffix({
    consumer: '0xb82896C4F251ed65186b416dbDb6f6192DFAF926',
    providers: ['0x0423189886d7966f0dd7e7d256898daeee625dca'],
})
const MysteryBox = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [reward, setReward] = useState(0);
    const [faucetBalance, setFaucetBalance] = useState(0); 
    const [isClaimable, setIsClaimable] = useState(false);
    const [particles, setParticles] = useState([]);
    const [isWaitingTx, setIsWaitingTx] = useState(false);
    const { address, chain, isConnected } = useAccount();
    const celoChainId = config.chains[0].id;
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [transactionSteps, setTransactionSteps] = useState<Step[]>([]);
    const [currentOperation, setCurrentOperation] = useState<'claim' | null>(null);
    const { sendTransactionAsync, isPending, isSuccess, isError, error } = useSendTransaction();

    const {
        switchChain,
        error: switchChainError,
        isError: isSwitchChainError,
        isPending: isSwitchChainPending,
    } = useSwitchChain();
    // Fetch faucet balance on component mount or when address changes
    useEffect(() => {
        const fetchFaucetBalance = async () => {
            try {
                if (!mysteryBoxContractAddress) return;

                const balance = await readContract(config, {
                    address: mysteryBoxContractAddress as `0x${string}`,
                    abi: mysteryBoxABI,
                    functionName: 'getFaucetBalance',
                    args: []
                });

                setFaucetBalance(parseFloat(balance.toString()));
            } catch (err) {
                console.error("Failed to fetch faucet balance:", err);
                toast.error("Failed to fetch faucet balance");
            }
        };

        fetchFaucetBalance();
    }, [address]);

    const handleSwitchChain = useCallback(() => {
        switchChain({ chainId: celoChainId });
    }, [switchChain, celoChainId]);

    const updateStepStatus = (stepId: string, status: StepStatus, errorMessage?: string) => {
        setTransactionSteps(prevSteps => prevSteps.map(step =>
            step.id === stepId
                ? { ...step, status, ...(errorMessage ? { errorMessage } : {}) }
                : step
        ));
    };


    // Generate floating particles for animation
    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 20; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 20 + 10,
                    color: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'][Math.floor(Math.random() * 7)],
                    delay: Math.random() * 2
                });
            }
            setParticles(newParticles);
        };
        generateParticles();
    }, []);
    const handleBoxClick = () => {
        if (isSpinning || showReward) return;

        setIsSpinning(true);

        // Spin animation for 3 seconds
        setTimeout(() => {
            setIsSpinning(false);
            setShowReward(true);

            // Generate a random reward between 1% and 10% of faucet balance
            const minPercent = 1;
            const maxPercent = 10;
            const randomPercent = minPercent + Math.random() * (maxPercent - minPercent);
            const calculatedReward = (faucetBalance * randomPercent) / 100;
            const formattedReward = parseFloat(calculatedReward.toFixed(2));

            setReward(formattedReward);
            setIsClaimable(true);
        }, 3000);
    };

    const handleClaim = async () => {
        if (!isClaimable || !address) return;
        if (chain?.id !== celoChainId) {
            if (isSwitchChainPending) {
                toast.info('Switching to Celo network...');
            }
            if (isSwitchChainError) {
                toast.error(`Failed to switch chain: ${switchChainError?.message || 'Unknown error'}`);
            } else {
                handleSwitchChain();
                toast.success('Successfully switched to the Celo network.');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            return false;
        }
 
            // Encode the transfer function
            const claimData = new Interface(mysteryBoxABI).encodeFunctionData('claim', [parseEther(reward.toString())]);
            const dataWithSuffix = dataSuffix + claimData;
            const tx = await sendTransactionAsync({
                to: mysteryBoxContractAddress as `0x${string}`,
                data: dataWithSuffix,
                value: parseEther(reward.toString()),
            });
         // Submit the referral to Divvi
        try {
          await submitReferral({
            txHash: tx as unknown as `0x${string}`,
            chainId: celoChainId
          });
        } catch (referralError) {
          console.error("Referral submission error:", referralError);
        }
        setTimeout(() => {
            setShowReward(false);
            setIsClaimable(false);
            setReward(0);
        }, 2000);
    };

    const resetBox = () => {
        setShowReward(false);
        setIsClaimable(false);
        setReward(0);
        // Find the current loading step and mark it as error
        const loadingStepIndex = transactionSteps.findIndex(step => step.status === 'loading');
        if (loadingStepIndex !== -1) {
            updateStepStatus(
                transactionSteps[loadingStepIndex].id,
                'error',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    };
    const getDialogTitle = () => {
        switch (currentOperation) {
            case 'claim':
                return 'Claim Your Reward';
            default:
                return 'Transaction';
        }
    };
    const openTransactionDialog = (operation: 'claim') => {
        setCurrentOperation(operation);
        setIsTransactionDialogOpen(true);
        setIsTransactionDialogOpen(true);
        let steps: Step[] = [];
        if (operation === 'claim') {
            steps = [
                {
                    id: 'check-chain',
                    title: 'Check Chain',
                    description: `Checking your wallet chain`,
                    status: 'inactive'
                },
                {
                    id: 'verify-faucet-balance',
                    title: 'Verify Faucet Balance',
                    description: `Verifying Mystery Box faucet balance`,
                    status: 'inactive'
                },
                {
                    id: 'request-claim',
                    title: 'Request Claim',
                    description: `Requesting claim`,
                    status: 'inactive'
                },
                {
                    id: 'confirm-transaction',
                    title: 'Confirm Transaction',
                    description: `Confirming claim`,
                    status: 'inactive'
                }
            ];
        }

        setTransactionSteps(steps);
    };
    // Check if all steps are completed
    const allStepsCompleted = transactionSteps.every(step => step.status === 'success');
    const hasError = transactionSteps.some(step => step.status === 'error');
    const closeTransactionDialog = () => {
        setIsTransactionDialogOpen(false);
        setCurrentOperation(null);
        // Reset steps after dialog closes with a delay
        setTimeout(() => {
            setTransactionSteps([]);
        }, 300);
    };
    // Handle click on the mystery box



    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600">
            {/* Animated background particles */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full opacity-20 animate-bounce"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: '3s'
                        }}
                    />
                ))}
            </div>

            {/* Rainbow gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-yellow-400/20 via-green-400/20 via-blue-400/20 via-indigo-400/20 to-purple-400/20 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                {/* Header with glowing effect */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse mb-4">
                        🎁 MYSTERY BOX 🎁
                    </h1>
                    <div className="flex justify-center space-x-2 text-2xl">
                        <Sparkles className="text-yellow-400 animate-spin" />
                        <Star className="text-pink-400 animate-bounce" />
                        <Heart className="text-red-400 animate-pulse" />
                        <Diamond className="text-blue-400 animate-spin" />
                        <Sparkles className="text-green-400 animate-bounce" />
                    </div>
                </div>

                {/* Mystery Box Container */}
                <div className="relative mb-12">
                    <div className="w-80 h-80 relative">
                        {/* Glowing ring effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-spin blur-xl opacity-60" />

                        {/* Main box */}
                        <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50 transform hover:scale-105 transition-all duration-300">
                            {showReward ? (
                                <div className="flex flex-col items-center justify-center h-full text-white animate-bounce">
                                    <div className="text-2xl font-bold mb-2">🎉 CONGRATULATIONS! 🎉</div>
                                    <div className="text-6xl font-black mb-2 drop-shadow-lg">{reward}</div>
                                    <div className="text-2xl font-bold">celoUSD</div>
                                    <div className="flex space-x-2 mt-4">
                                        <Sparkles className="text-yellow-300 animate-pulse" />
                                        <Star className="text-white animate-spin" />
                                        <Sparkles className="text-yellow-300 animate-pulse" />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={handleBoxClick}
                                    className="cursor-pointer w-full h-full flex items-center justify-center relative group"
                                >
                                    {/* Gift icon with animation */}
                                    <div className={`relative ${isSpinning ? 'animate-spin' : 'group-hover:animate-bounce'}`}>
                                        <Gift
                                            size={120}
                                            className="text-white drop-shadow-2xl"
                                        />
                                        {/* Pulsing glow effect */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-32 h-32 rounded-full bg-white/30 blur-2xl animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Spinning sparkles around the gift */}
                                    {!isSpinning && (
                                        <>
                                            <Sparkles className="absolute top-4 left-4 text-yellow-300 animate-pulse" size={24} />
                                            <Star className="absolute top-4 right-4 text-pink-300 animate-bounce" size={20} />
                                            <Heart className="absolute bottom-4 left-4 text-red-300 animate-pulse" size={22} />
                                            <Diamond className="absolute bottom-4 right-4 text-blue-300 animate-bounce" size={18} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instruction text */}
                    {!showReward && !isSpinning && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-full shadow-xl border-2 border-white/50 animate-bounce">
                                <p className="text-white font-bold text-lg">✨ TAP TO OPEN! ✨</p>
                            </div>
                        </div>
                    )}

                    {/* Loading spinner overlay */}
                    {isSpinning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-96 h-96 border-8 border-t-yellow-400 border-r-pink-400 border-b-purple-400 border-l-blue-400 rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {showReward && (
                        <button
                            onClick={handleClaim}
                            disabled={!isClaimable}
                            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-black py-4 px-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 text-xl border-4 border-white/50 animate-pulse"
                        >
                            🚀 CLAIM REWARD 🚀
                        </button>
                    )}

                    {showReward && (
                        <button
                            onClick={resetBox}
                            className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/50"
                        >
                            🎲 Try Again
                        </button>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-12 text-center max-w-2xl">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-4">🌈 How It Works 🌈</h3>
                        <p className="text-white text-lg leading-relaxed">
                            Open the magical mystery box to win amazing celoUSD tokens!
                            You could win anywhere between <span className="font-bold text-yellow-300">0.1%</span> and <span className="font-bold text-green-300">20%</span> of the faucet balance.
                        </p>
                        <div className="mt-6 flex justify-center items-center space-x-4">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full">
                                <span className="text-white font-bold">💰 Faucet Balance: {faucetBalance.toLocaleString()} celoUSD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating action elements */}
                <div className="fixed top-4 right-4 flex flex-col space-y-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full shadow-lg animate-bounce">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full shadow-lg animate-pulse">
                        <Star className="text-white" size={24} />
                    </div>
                </div>

                <div className="fixed top-4 left-4 flex flex-col space-y-2">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-full shadow-lg animate-spin">
                        <Heart className="text-white" size={24} />
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full shadow-lg animate-bounce">
                        <Diamond className="text-white" size={24} />
                    </div>
                </div>
            </div>
            {/* Multi-step Transaction Dialog */}
            <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => !isWaitingTx && !open && closeTransactionDialog()}>
                <DialogContent className="sm:max-w-md border rounded-lg">
                    <DialogHeader>
                        <DialogTitle className='text-black/90 dark:text-white/90'>{getDialogTitle()}</DialogTitle>
                        <DialogDescription>
                            {currentOperation === 'claim' ?
                                `Claiming your reward of ${reward} CUSD...` :
                                'Processing transaction...'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Transaction Steps */}
                    <TransactionSteps steps={transactionSteps} />

                    <DialogFooter className="flex justify-between text-black/90 dark:text-white/90">
                        <Button
                            variant="outline"
                            onClick={closeTransactionDialog}
                            disabled={isWaitingTx && !hasError}
                        >
                            {hasError ? 'Close' : allStepsCompleted ? 'Done' : 'Cancel'}
                        </Button>
                        {hasError && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    closeTransactionDialog();
                                }}
                            >
                                Try Again
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MysteryBox;