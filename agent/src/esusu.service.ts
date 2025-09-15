// @ts-nocheck
import { EVMWalletClient } from '@goat-sdk/wallet-evm';
import { Tool } from '@goat-sdk/core';
import { z } from 'zod';
import { EsusuParameters, EmptyParameters, UserAddressParameters } from './parameters';
import { contractAddress, abi } from "../lib/utils";


export class MysteryBoxFaucetService {

    private readonly contractAddress: string = contractAddress;
    private readonly abi = abi;
    private client: EVMWalletClient;

    
    // @ts-ignore
    @Tool({
        name: 'claimTokens',
        description: 'Claim tokens from the MysteryBox faucet with random percentage (1-20%)'
    })
    public async claimTokens(
        // @ts-ignore
        params: EsusuParameters
    ) {
        try {
            const percentage = params.amount || Math.floor(Math.random() * 20) + 1; // Use provided amount or random
            const tx = await this.client.writeContract({
                address: this.contractAddress,
                abi: this.abi,
                functionName: 'claimTokens',
                args: [percentage]
            });

            const receipt = await this.client.publicClient.waitForTransactionReceipt({ hash: tx });

            if (receipt.status === 'success') {
                return `Successfully claimed ${percentage}% of the faucet balance. Transaction hash: ${tx}`;
            } else {
                return `Claim transaction failed. Transaction hash: ${tx}`;
            }
        } catch (error: any) {
            console.error('Error claiming tokens:', error.message);
            if (error.message.includes('Wait for cooldown')) {
                const cooldownTime = await this.getClaimCooldown({ userAddress: this.client.account.address });
                return `You cannot claim yet. ${cooldownTime}`;
            }
            return 'Failed to claim tokens. The account may not be authorized or another error occurred.';
        }
    }

    /**
     * Claims a random percentage of the MysteryBox faucet balance for a specified user.
     * This can only be called by the authorized AI.
     * @param params The parameters for the tool, including the recipient's address and an optional amount.
     * @returns A promise that resolves with a message indicating the result of the claim.
     */
    @Tool({
        name: 'claimForUser',
        description: 'Claim tokens from the MysteryBox faucet for a specific user with a random percentage (1-20%)',
        parameters: EsusuParameters,
    })
    public async claimForUser(
        // @ts-ignore
        params: EsusuParameters
    ) {
        if (!params.recipient) {
            return 'A recipient address must be provided to claim for a user.';
        }
        try {
            const percentage = params.amount || Math.floor(Math.random() * 20) + 1;
            const tx = await this.client.writeContract({
                address: this.contractAddress,
                abi: this.abi,
                functionName: 'claimForUser',
                args: [params.recipient, percentage]
            });

            const receipt = await this.client.publicClient.waitForTransactionReceipt({ hash: tx });

            if (receipt.status === 'success') {
                return `Successfully initiated claim for ${percentage}% of the faucet balance for user ${params.recipient}. Transaction hash: ${tx}`;
            } else {
                return `Claim transaction for ${params.recipient} failed. Transaction hash: ${tx}`;
            }
        } catch (error: any) {
            console.error('Error claiming tokens for user:', error.message);
            if (error.message.includes('Wait for cooldown')) {
                const cooldownTime = await this.getClaimCooldown({ userAddress: params.recipient });
                return `The user ${params.recipient} cannot claim yet. ${cooldownTime}`;
            }
            return `Failed to claim tokens for ${params.recipient}. The account may not be authorized or another error occurred.`;
        }
    }

    // @ts-ignore
    @Tool({
        name: 'fundFaucet',
        description: 'Fund the MysteryBox faucet with tokens'
    })
    async fundFaucet(
        walletClient: EVMWalletClient, 
        parameters: EsusuParameters
    ): Promise<string> {
        if (!parameters.amount) {
            throw new Error('Amount is required');
        }
        
        const tx = await walletClient.sendTransaction({
            to: this.contractAddress,
            abi: this.abi,
            functionName: 'fundFaucet',
            args: [parameters.amount]
        });
        return tx.hash;
    }
    
    // @ts-ignore
    @Tool({
        name: 'emergencyWithdraw',
        description: 'Emergency withdraw tokens from the faucet (owner only)'
    })
    async emergencyWithdraw(
        walletClient: EVMWalletClient, 
        parameters: EsusuParameters
    ): Promise<string> {
        if (!parameters.amount) {
            throw new Error('Amount is required');
        }
        
        const tx = await walletClient.sendTransaction({
            to: this.contractAddress,
            abi: this.abi,
            functionName: 'emergencyWithdraw',
            args: [parameters.amount]
        });
        return tx.hash;
    }
    
    // @ts-ignore
    @Tool({
        name: 'getFaucetBalance',
        description: 'Get the current balance of the MysteryBox faucet'
    })
    async getFaucetBalance(
        walletClient: EVMWalletClient,
        parameters: EmptyParameters
    ): Promise<string> {
        try {
            const balance = await walletClient.read({
                address: this.contractAddress,
                abi: this.abi,
                functionName: 'getFaucetBalance',
                args: []
            });
            return balance.toString();
        } catch (error) {
            console.error('Error getting faucet balance:', error);
            return 'Error: Could not retrieve faucet balance. Please try asking again later.';

        }
    }
    
    // @ts-ignore
    @Tool({
        name: 'getClaimCooldown',
        description: 'Get the remaining claim cooldown time for a specific user'
    })
    public async getClaimCooldown(
        // @ts-ignore
        params: UserAddressParameters
    ) {
        try {
            const remainingTime = await this.client.readContract({
                address: this.contractAddress,
                abi: this.abi,
                functionName: 'getRemainingCooldown',
                args: [params.userAddress]
            });

            if (Number(remainingTime) === 0) {
                return 'You can claim tokens now!';
            }

            return `You need to wait ${remainingTime} seconds before you can claim again.`;
        } catch (error) {
            console.error('Error getting claim cooldown:', error);
            return 'Failed to get claim cooldown time.';
        }
    }
    
    // @ts-ignore
    @Tool({
        name: 'getLastClaimTime',
        description: 'Get the last time a specific user claimed tokens from the faucet'
    })
    public async getLastClaimTime(
        // @ts-ignore
        params: UserAddressParameters
    ) {
        try {
            const lastClaimTime = await this.client.readContract({
                address: this.contractAddress,
                abi: this.abi,
                functionName: 'lastReceiveTime',
                args: [params.userAddress]
            });

            const lastClaimDate = new Date(Number(lastClaimTime) * 1000);

            if (Number(lastClaimTime) === 0) {
                return 'This user has not claimed any tokens yet.';
            }

            return `The user last claimed tokens on: ${lastClaimDate.toLocaleString()}.`;
        } catch (error) {
            console.error('Error getting last claim time:', error);
            return 'Failed to get the last claim time.';
        }
    }
}