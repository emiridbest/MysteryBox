"use client";

import React from 'react';
import { Loader2 } from "lucide-react";

interface ClaimStatusDisplayProps {
    isLoading: boolean;
    canClaim: boolean;
    timeRemaining: string;
}

export default function ClaimStatusDisplay({
    isLoading,
    canClaim,
    timeRemaining,
}: ClaimStatusDisplayProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-semibold">
                    Checking eligibility...
                </span>
            </div>
        );
    }
    
    if (!canClaim) {
        return (
            <div className="text-center py-6 px-4 space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-950 rounded-xl shadow-md border border-purple-200 dark:border-indigo-800">
                <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-300">
                    Next claim available in:
                </p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse">
                    {timeRemaining}
                </p>
                <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-400 rounded-full my-3"></div>
                <p className="text-sm bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 px-4 py-2 rounded-lg text-white dark:text-gray-900 font-medium inline-block">
                    You have already opened a Mystery Box today.
                </p>
            </div>
        );
    }
    
    return null;
}