'use client';

import React from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { CreateProjectModal } from './create-project-modal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-[#09090B] text-zinc-100 overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-[#09090B] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Project Creation Modal */}
      <CreateProjectModal />
    </div>
  );
};
