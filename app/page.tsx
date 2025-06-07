"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PhoneIcon, Smartphone, Zap, Tv, WalletIcon, CreditCard, Loader2 } from 'lucide-react';
import Head from 'next/head';

import { ToastContainer } from 'react-toastify';

// Main content component - separated to use the useUtility hook
function MainContent() {

  return (
    <div className="container mx-auto">
      {/* Main Utility Bills Card */}

    </div>
  );
}

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainContent />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

    </div>
  );
}

export default App;
