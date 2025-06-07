"use client";
import { Button } from "../../components/ui/button";
import { ExternalLink, MessageCircle, Users, Clock, Headphones } from "lucide-react";
import React from "react";

export default function ContactPage() {
  const telegramLink = "https://t.me/+kYeSswiKgB9lMjZk"; 
  

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen bg-gradient-to-br from-white via-yellow-50/40 to-yellow-100/30 dark:from-black dark:via-gray-900 dark:to-yellow-900/20">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-full mb-6 shadow-xl shadow-yellow-500/25 border-2 border-black dark:border-white">
            <Headphones className="w-10 h-10 text-black dark:text-white" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-black via-yellow-700 to-yellow-600 dark:from-white dark:via-yellow-300 dark:to-yellow-400 bg-clip-text text-transparent mb-4">
            Contact Support
          </h1>
          
          <div className="inline-block bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800/50 dark:to-yellow-700/40 rounded-full px-6 py-2 border-2 border-black/20 dark:border-yellow-400/30">
            <p className="text-black dark:text-yellow-100 font-medium">
              💬 Farcaster Mini App Support
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-2xl border-2 border-yellow-400 dark:border-yellow-500 shadow-2xl shadow-yellow-500/20 dark:shadow-yellow-500/30 p-8 mb-8">
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg border-2 border-black/10 dark:border-yellow-600/30">
              <Users className="w-6 h-6 text-black dark:text-yellow-400 mb-2" />
              <span className="text-sm font-bold text-black dark:text-yellow-200">Farcaster Community</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg border-2 border-black/10 dark:border-yellow-600/30">
              <Clock className="w-6 h-6 text-black dark:text-yellow-400 mb-2" />
              <span className="text-sm font-bold text-black dark:text-yellow-200">Quick Response</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg border-2 border-black/10 dark:border-yellow-600/30">
              <MessageCircle className="w-6 h-6 text-black dark:text-yellow-400 mb-2" />
              <span className="text-sm font-bold text-black dark:text-yellow-200">Live Support</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800/40 dark:to-yellow-700/30 rounded-xl p-6 mb-8 border-2 border-black/10 dark:border-yellow-500/40">
            <p className="text-black dark:text-yellow-100 text-lg leading-relaxed font-medium">
              Join our Telegram community for instant support with your Farcaster mini app experience. 
              Get help with data bundles, verification, and connect with other users! 🚀
            </p>
          </div>

          {/* CTA Button */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Button
              onClick={() => window.open(telegramLink, "_blank")}
              size="lg"
              className="relative w-full md:w-auto bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-yellow-400 dark:text-black font-bold text-lg py-6 px-8 rounded-xl border-2 border-yellow-400 dark:border-black shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/20 dark:bg-black/20 rounded-full">
                  <ExternalLink size={20} />
                </div>
                <span>Join Telegram Support</span>
                <div className="w-2 h-2 bg-yellow-400 dark:bg-black rounded-full animate-pulse"></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Support Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/30 rounded-xl p-6 border-2 border-black/10 dark:border-yellow-500/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-400 dark:text-black" />
              </div>
              <h3 className="font-bold text-black dark:text-yellow-200">Response Time</h3>
            </div>
            <p className="text-black/80 dark:text-yellow-100 text-sm font-medium">
              Typically within an hour including business days and weekends
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/30 rounded-xl p-6 border-2 border-black/10 dark:border-yellow-500/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-yellow-400 dark:text-black" />
              </div>
              <h3 className="font-bold text-black dark:text-yellow-200">Mini App Users</h3>
            </div>
            <p className="text-black/80 dark:text-yellow-100 text-sm font-medium">
              Join 1,000+ users getting free data
            </p>
          </div>
        </div>

        {/* Footer Message */}
        <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800/50 dark:to-yellow-700/40 rounded-xl p-6 border-2 border-black/20 dark:border-yellow-400/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-yellow-400 dark:text-black" />
            </div>
            <span className="font-bold text-black dark:text-yellow-200">Customer Support</span>
          </div>
          <p className="text-black/80 dark:text-yellow-100 text-sm font-medium">
            Get help with data claiming, wallet connection, verification issues, and general questions about using our mini app.
            Our community is here to help! 💛
          </p>
        </div>
      </div>
    </div>
  );
}
