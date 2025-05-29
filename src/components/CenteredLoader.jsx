import React from 'react';
import LoaderComponent from './Loader';

const CenteredLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col items-center justify-center fixed inset-0 z-50">
      <LoaderComponent />
      <p className="text-gray-600 text-lg font-medium mt-4">
        טוען...
      </p>
    </div>
  );
};

export default CenteredLoader; 