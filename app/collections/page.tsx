// app/collections/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';

export default function CollectionsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to profile if authenticated, otherwise to login
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/profile');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Collections" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-mise-500 border-opacity-50 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return null; // Will redirect due to useEffect
}