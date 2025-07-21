'use client';

import React from 'react';

const MessagesListPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="font-satoshi tracking-satoshi-tight text-3xl font-bold mb-4">Messages</h1>
      <p>List of active message threads.</p>
      {/* TODO: Add authentication check */}
      {/* TODO: Fetch and display message threads */}
    </div>
  );
};

export default MessagesListPage; 