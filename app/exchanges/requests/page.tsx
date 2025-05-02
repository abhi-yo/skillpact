'use client';

import React from 'react';

const ExchangeRequestsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="font-satoshi tracking-satoshi-tight text-3xl font-bold mb-4">Exchange Requests</h1>
      <p>Incoming and outgoing service exchange requests.</p>
      {/* TODO: Add authentication check */}
      {/* TODO: Fetch and display exchange requests */}
    </div>
  );
};

export default ExchangeRequestsPage; 