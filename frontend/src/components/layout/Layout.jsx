import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header />
      <Sidebar />
      <div className="pl-64 pt-16 min-h-screen flex flex-col">
        <main className="flex-1 w-full bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
}
