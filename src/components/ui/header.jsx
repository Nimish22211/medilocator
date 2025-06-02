'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>MediLocator</span>
        </Link>
      </div>
    </header>
  );
} 