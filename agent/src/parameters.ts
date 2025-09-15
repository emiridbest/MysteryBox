import { createToolParameters } from '@goat-sdk/core';
import { z } from 'zod';

export const EmptyParameters = createToolParameters(z.object({}));

const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a"
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid address');

export class EsusuParameters extends createToolParameters(
    z.object({
        amount: z.string().optional().describe("Amount of tokens in wei (as string)"),
        account: addressSchema.optional().describe("Account address to check or interact with"),
        recipient: addressSchema.optional().describe("Recipient address for AI claims"),
        tokenAddress: addressSchema.optional().describe("Token address (optional)"),
        cusdTokenAddress: z.string().default(CUSD_TOKEN_ADDRESS).describe("celoUSD token address"),
    })
) {}

export const UserAddressParameters = createToolParameters(
    z.object({
        userAddress: z.string().describe("The user's wallet address"),
    })
);