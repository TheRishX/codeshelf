/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SmartIcon from './SmartIcon';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddNewClick: () => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onAddNewClick,
  notificationCount,
  setNotificationCount,
  isSidebarCollapsed,
  onToggleSidebar
}: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full h-16 bg-white border-b border-[#E5E5E5] flex justify-between items-center px-6">
      
      {/* Brand logo & Horizontal Web Nav */}
      <div className="flex items-center gap-5">
        {/* Sidebar collapse controller button */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 hover:bg-slate-50 text-slate-400 hover:text-[#FF6B00] rounded-xl transition-all cursor-pointer shrink-0"
          title={isSidebarCollapsed ? "Expand study space" : "Hide navigation rail"}
        >
          <SmartIcon name={isSidebarCollapsed ? "menu_open" : "menu"} size={18} />
        </button>

        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setActiveTab('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center shadow-sm">
            <SmartIcon name="auto_stories" className="text-white" size={16} />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-[#1A1A1A]">
            Code<span className="text-[#FF6B00]">Shelf</span>
          </span>
        </div>

        {/* Desktop Top Tabs linking items */}
        <nav className="hidden md:flex gap-6 items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-sans text-sm font-bold transition-all border-b-2 py-4 px-1 ${
              activeTab === 'home'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`font-sans text-sm font-bold transition-all border-b-2 py-4 px-1 ${
              activeTab === 'subjects' || activeTab === 'subject-detail'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`font-sans text-sm font-bold transition-all border-b-2 py-4 px-1 ${
              activeTab === 'videos'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
            }`}
          >
            Video Vault
          </button>
          <button
            onClick={() => setActiveTab('concepts')}
            className={`font-sans text-sm font-bold transition-all border-b-2 py-4 px-1 ${
              activeTab === 'concepts'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-gray-500 hover:text-[#FF6B00]'
            }`}
          >
            Concepts
          </button>
        </nav>
      </div>

      {/* Global Interactive Controls */}
      <div className="flex items-center gap-4">
        
        {/* Global Search box */}
        <div className="relative max-w-xs hidden sm:block">
          <SmartIcon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, videos, concepts..."
            className="bg-gray-100 text-[#1A1A1A] border border-[#E5E5E5] rounded-full pl-9 pr-4 py-1.5 w-60 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/40 focus:bg-white focus:border-[#FF6B00] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Global quick add & notification badges */}
        <div className="flex items-center gap-1">
          <button
            onClick={onAddNewClick}
            className="p-2 text-gray-500 hover:bg-[#FFF5EE] hover:text-[#FF6B00] rounded-full transition-all duration-150 active:scale-90"
            title="Add note, concept or video"
          >
            <SmartIcon name="add" size={20} />
          </button>
          
          <button
            onClick={() => {
              if (notificationCount > 0) {
                alert("Notifications: Welcome back! You have 3 custom daily goals left to study today: Complete JS Prototype note, watch events video, and organize micro-concepts.");
                setNotificationCount(0);
              } else {
                alert("You're all caught up! Keep studying to complete your bookshelf targets.");
              }
            }}
            className="p-2 text-gray-500 hover:bg-[#FFF5EE] hover:text-[#FF6B00] rounded-full relative transition-all duration-150 active:scale-90"
            title="Alerts"
          >
            <SmartIcon name="notifications" size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF6B00] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
