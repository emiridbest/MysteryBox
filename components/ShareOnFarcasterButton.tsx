"use client";
import React from 'react';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import sdk from "@farcaster/frame-sdk";

interface ShareButtonProps {
  amount: number;
  showCelebration?: boolean;
}

const ShareOnFarcasterButton: React.FC<ShareButtonProps> = ({ amount, showCelebration = true }) => {
  
  const handleShare = async () => {
    try {
      
      await sdk.actions.composeCast({
        text: showCelebration 
          ? `🎉 I just claimed ${amount} celoUSD from the Mystery Box! 🎁\n\nClaim your free celoUSD too! 👇\n\n#MysteryBox #Farcaster #Celo`
          : `Check out the Mystery Box where you can claim free celoUSD! 🎁\n\n#MysteryBox #Farcaster #Celo`,
        embeds: [
            `https://farcaster.xyz/miniapps/AOtXZfuRPcqh/mystery?ref=share`
        ]
      });

      toast.success("Successfully shared to Farcaster!");
    } catch (error) {
      console.error("Failed to share to Farcaster:", error);
      toast.error("Failed to share to Farcaster. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleShare}
      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
    >
      <Share2 size={18} />
      Share on Farcaster
    </Button>
  );
};

export default ShareOnFarcasterButton;
