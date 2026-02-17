import React from 'react';
import { Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center">
      <header className="w-full max-w-md bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="text-teal-500 w-6 h-6" />
          <h1 className="font-bold text-lg text-slate-700 tracking-tight">Shigoto Mind Check</h1>
        </div>
      </header>

      <main className="w-full max-w-md flex-1 p-4 pb-24">
        {children}
      </main>

      <footer className="w-full max-w-md p-4 text-center text-xs text-slate-400">
        <p>© 2024 Shigoto Mind Stress Check MVP</p>
        <p className="mt-1">※本ツールは医療診断ではありません</p>
      </footer>
    </div>
  );
};

export default Layout;
