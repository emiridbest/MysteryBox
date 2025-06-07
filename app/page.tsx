"use client";
import React, { useState } from 'react';

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
