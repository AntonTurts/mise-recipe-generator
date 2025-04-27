// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="p-4 border-b shadow-sm bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-green-600 tracking-tight hover:text-green-700 transition-colors">
          Mise<span className="text-gray-400 text-sm align-top ml-1">en place</span>
        </Link>
        
        {title && (
          <h2 className="text-lg font-medium hidden md:block">{title}</h2>
        )}
        
        <Link 
          href={isAuthenticated ? "/profile" : "/login"} 
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <User className="h-5 w-5 text-gray-600" />
        </Link>
      </div>
    </header>
  );
}