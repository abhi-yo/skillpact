'use client';

import React from 'react';

const MyServicesPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="font-satoshi tracking-satoshi-tight text-3xl font-bold mb-4">My Services</h1>
      <p>List of the logged-in user's offered services.</p>
      {/* TODO: Add authentication check */}
      {/* TODO: Fetch and display user's services */}
    </div>
  );
};

export default MyServicesPage; 