'use client';

import React from 'react';

interface EditServicePageProps {
  params: { serviceId: string };
}

const EditServicePage: React.FC<EditServicePageProps> = ({ params }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="font-satoshi tracking-satoshi-tight text-3xl font-bold mb-4">Edit Service ({params.serviceId})</h1>
      <p>Form to edit an existing service listing.</p>
      {/* TODO: Add authentication check */}
      {/* TODO: Fetch service data and implement form */}
    </div>
  );
};

export default EditServicePage; 