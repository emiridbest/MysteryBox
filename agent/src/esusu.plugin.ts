import { PluginBase, Chain } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MysteryBoxFaucetService } from "./esusu.service";

export class EsusuPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("mysterybox-faucet", [new MysteryBoxFaucetService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export const esusu = () => new EsusuPlugin();