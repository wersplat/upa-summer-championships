'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-navy to-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-extrabold text-white drop-shadow">
                  UPA Summer Championships
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/teams"
                  className={`${pathname === '/teams' ? 'border-gold text-white' : 'border-transparent text-white/70 hover:border-gold hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Teams
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gold hover:text-orange focus:outline-none focus:ring-2 focus:ring-orange"
              >
                <span className="sr-only">Toggle dark mode</span>
                {darkMode ? (
                  <SunIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-navy border-t border-blue mt-8 text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white/80">
            &copy; {new Date().getFullYear()} UPA Summer Championships. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
