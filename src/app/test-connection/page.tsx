'use client';

import { useEffect, useState } from 'react';
import { checkFirebaseConnection } from '@/lib/firebase';

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);

  useEffect(() => {
    // Check Firebase connection
    checkFirebaseConnection().then(({ connected, error }) => {
      if (connected) {
        setConnectionStatus('✅ Connected to Firebase');
      } else {
        setConnectionStatus(`❌ Connection failed: ${error}`);
      }
    });

    // Show Firebase config (without sensitive data)
    setFirebaseConfig({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      // Don't expose API keys in the frontend in production
      // This is just for debugging
      // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    });
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <p className={connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
          {connectionStatus}
        </p>
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Firebase Configuration</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(firebaseConfig, null, 2)}
        </pre>
      </div>

      <div className="mt-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <p className="mb-2">NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Not set'}</p>
        <p className="mb-2">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Not set'}</p>
        <p className="mb-2">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Not set'}</p>
      </div>
    </div>
  );
}
