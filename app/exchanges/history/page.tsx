'use client';

import React from 'react';

const ExchangeHistoryPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="font-satoshi tracking-satoshi-tight text-3xl font-bold mb-4">Exchange History</h1>
      <p>Archive of completed exchanges.</p>
      {/* TODO: Add authentication check */}
      {/* TODO: Fetch and display past exchanges */}
    </div>
  );
};

export default ExchangeHistoryPage; 