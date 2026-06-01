/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Subject } from '../types';
import SmartIcon from './SmartIcon';

interface Book3DProps {
  key?: React.Key | string;
  subject: Subject;
  onClick: () => void;
  onFavoriteToggle?: (e: React.MouseEvent) => void | Promise<void>;
  onDelete: (e: React.MouseEvent) => void | Promise<void>;
}

export default function Book3D({ subject, onClick, onFavoriteToggle, onDelete }: Book3DProps) {
  const { title, coverColor, progress, icon, category, favorite } = subject;

  // Render SVG circular progress ring
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center group cursor-pointer animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Geometric Balance Flat Book Cover Container */}
      <div className="relative mb-4">
        {/* The beautiful geometric cover */}
        <div 
          className={`w-32 h-44 ${coverColor || 'bg-[#FF6B00]'} rounded-l-md rounded-r-2xl geometric-book-cover flex flex-col justify-between p-3.5 relative overflow-hidden`}
        >
          {/* Vertical binder layout crease line mimicking premium notebooks */}
          <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black/15 border-r border-white/10 z-20"></div>
          <div className="absolute inset-y-0 right-0 w-1 bg-white/5 z-20"></div>
          
          {/* Top cover slot: Icon Badge & Delete */}
          <div className="flex justify-between items-start z-30 pl-2">
            <span className="p-1 rounded bg-[#ffffff25] text-white">
              <SmartIcon name={icon} className="text-white/90" size={12} />
            </span>
            <div className="flex gap-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="p-1 rounded-full bg-black/10 text-white/50 hover:text-red-400 hover:bg-black/30 hover:scale-110 active:scale-95 transition-all outline-none relative z-40"
                title="Delete this book folder"
              >
                <SmartIcon name="delete" size={12} />
              </button>
            </div>
          </div>

          {/* Spine design center decor */}
          <div className="my-1 border-t border-b border-white/15 py-1 flex flex-col gap-0.5 justify-center items-center z-10 pl-2">
            <span className="text-[8px] text-white/80 uppercase tracking-widest font-sans font-bold">
              {category || 'HANDBOOK'}
            </span>
          </div>

          {/* Book Bottom Info: Title & Mini progress bar */}
          <div className="z-10 mt-auto pl-2">
            <h3 className="font-sans font-bold text-white leading-tight text-xs drop-shadow-md truncate" title={title}>
              {title}
            </h3>
            <div className="flex items-center justify-between gap-1.5 mt-2">
              <div className="flex-1 bg-black/25 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-[8px] font-bold text-white bg-black/15 px-1 rounded">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic ambient shadow to resemble true geometric objects */}
        <div className="absolute -bottom-1.5 left-2 right-2 h-1.5 bg-black/15 blur-sm rounded-full -z-10 transition-all group-hover:scale-105 group-hover:opacity-75"></div>
      </div>

      {/* Sub Title details and Circular completion indicators */}
      <div className="text-center w-full max-w-[130px]">
        <p className="text-xs font-bold font-sans text-gray-800 hover:text-[#FF6B00] transition-colors truncate" title={title}>
          {title}
        </p>
        
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {progress >= 100 ? (
            <div className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center shadow-sm" title="Completed">
              <SmartIcon name="check" size={10} className="stroke-[3]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center relative bg-white shadow-xs" title={`${progress}% complete`}>
              <span className="text-[7px] font-bold text-[#FF6B00] font-sans">{progress}%</span>
              <svg className="absolute inset-0 w-5 h-5 rotate-[-90deg]">
                <circle 
                  cx="10" 
                  cy="10" 
                  r="7.5" 
                  fill="transparent" 
                  stroke="#f3f4f6" 
                  strokeWidth="1.5" 
                />
                <circle 
                  cx="10" 
                  cy="10" 
                  r="7.5" 
                  fill="transparent" 
                  stroke="#FF6B00" 
                  strokeWidth="1.5" 
                  strokeDasharray={2 * Math.PI * 7.5}
                  strokeDashoffset={(2 * Math.PI * 7.5) - (progress / 100) * (2 * Math.PI * 7.5)}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
