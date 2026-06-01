/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import SmartIcon from './SmartIcon';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddNewClick: () => void;
  totalBooks: number;
  notesSaved: number;
  userName: string;
  userTitle: string;
  userAvatar: string;
  isSidebarCollapsed: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onAddNewClick,
  totalBooks,
  notesSaved,
  userName,
  userTitle,
  userAvatar,
  isSidebarCollapsed
}: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: 'auto_stories' },
    { id: 'subjects', label: 'Subjects', icon: 'subject' },
    { id: 'videos', label: 'Video Vault', icon: 'video_library' },
    { id: 'concepts', label: 'Concept Bank', icon: 'lightbulb' },
    { id: 'archive', label: 'Archive', icon: 'inventory_2' }
  ];

  return (
    <aside className={`hidden md:flex flex-col h-screen p-5 gap-4 bg-white border-r border-[#eceef0] fixed left-0 top-0 transition-all duration-300 z-40 pt-20 ${
      isSidebarCollapsed ? 'w-0 -translate-x-full opacity-0 pointer-events-none overflow-hidden' : 'w-64 translate-x-0'
    }`}>
      
      {/* Profile Area */}
      <div 
        onClick={() => setActiveTab('settings')}
        className="flex items-center gap-3 px-2 mb-6 cursor-pointer hover:bg-[#FFF5EE]/50 p-1.5 rounded-xl transition-all group"
        title="Edit Personal Information"
      >
        <div className="relative shrink-0">
          <img
            alt={userName}
            className="w-11 h-11 rounded-full border-2 border-[#FF6B00] bg-slate-100 object-cover shadow-sm transition-all group-hover:scale-105 duration-200"
            src={userAvatar}
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-white text-[8px] font-bold group-hover:bg-[#FF6B00] transition-colors">
            <SmartIcon name="edit" size={8} />
          </div>
        </div>
        <div className="overflow-hidden">
          <p className="font-sans font-bold text-[#1A1A1A] text-xs leading-tight group-hover:text-[#FF6B00] transition-colors truncate">{userName}</p>
          <p className="text-[10px] text-gray-500 font-medium font-sans truncate">{userTitle}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 mb-6">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-bold text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#FFF5EE] text-[#FF6B00]'
                  : 'text-gray-500 hover:bg-[#FFF5EE]/50 hover:text-[#FF6B00]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-1 top-3 bottom-3 w-1 bg-[#FF6B00] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <SmartIcon
                name={item.icon}
                className={`transition-transform duration-200 group-hover:translate-x-0.5 ${
                  isActive ? 'text-[#FF6B00]' : 'text-gray-400'
                }`}
                size={18}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-2 border-t border-[#E5E5E5] pt-4">
        {/* Glowing Orange Add Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddNewClick}
          className="bg-gradient-to-br from-[#FF6B00] to-[#FF9E4D] text-white rounded-xl py-3 font-sans font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <SmartIcon name="add" className="text-white" size={18} />
          <span>Add To Library</span>
        </motion.button>

        <a
          href="#settings"
          onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all group ${
            activeTab === 'settings'
              ? 'bg-[#FFF5EE] text-[#FF6B00] font-bold'
              : 'text-gray-500 hover:bg-[#FFF5EE]/50 hover:text-[#FF6B00]'
          }`}
        >
          <SmartIcon name="settings" className="text-gray-400 group-hover:rotate-45 transition-transform" size={17} />
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
}
