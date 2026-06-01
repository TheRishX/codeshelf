/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryItem, Subject } from '../types';
import SmartIcon from './SmartIcon';

interface ItemDrawerProps {
  item: LibraryItem | null;
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem: (updated: LibraryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdatePdfUrl?: (subjectId: string, pdfUrl: string) => void; // Remember PDF automatically!
}

export default function ItemDrawer({
  item,
  subject,
  isOpen,
  onClose,
  onUpdateItem,
  onDeleteItem,
  onUpdatePdfUrl
}: ItemDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedUrl, setEditedUrl] = useState('');
  const [editedTags, setEditedTags] = useState('');
  
  // PDF remembering feature local tracker
  const [pdfInput, setPdfInput] = useState('');
  const [showPdfInput, setShowPdfInput] = useState(false);

  useEffect(() => {
    if (item) {
      setEditedTitle(item.title);
      setEditedContent(item.content);
      setEditedUrl(item.url || '');
      setEditedTags(item.tags.join(', '));
    }
    setIsEditing(false);
  }, [item]);

  useEffect(() => {
    if (subject) {
      setPdfInput(subject.pdfUrl || '');
    }
  }, [subject]);

  if (!item) return null;

  const handleSave = () => {
    onUpdateItem({
      ...item,
      title: editedTitle,
      content: editedContent,
      url: editedUrl.trim() || undefined,
      tags: editedTags.split(',').map(t => t.trim()).filter(Boolean),
      lastOpenedAt: Date.now()
    });
    setIsEditing(false);
  };

  const handleToggleBookmark = () => {
    onUpdateItem({
      ...item,
      bookmarked: !item.bookmarked
    });
  };

  const handleToggleArchive = () => {
    onUpdateItem({
      ...item,
      archived: !item.archived
    });
    onClose();
  };

  const handleSavePdf = () => {
    if (subject && onUpdatePdfUrl) {
      onUpdatePdfUrl(subject.id, pdfInput);
      setShowPdfInput(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
          
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-2xl bg-[#FAFAFA] shadow-2xl relative flex flex-col h-full border-l border-[#E5E5E5]"
          >
            {/* Top Toolbar panel */}
            <div className="bg-white border-b border-[#E5E5E5] p-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFF5EE] text-[#FF6B00]">
                  <SmartIcon name={item.type === 'note' ? 'stickynote' : item.type === 'video' ? 'video' : 'lightbulb'} size={16} />
                </span>
                <span className="text-xs font-bold font-sans uppercase tracking-wider text-gray-500">
                  {item.type} Space • {subject?.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                
                {/* Save bookmark */}
                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-full hover:bg-slate-50 transition-all ${
                    item.bookmarked ? 'text-[#FF6B00]' : 'text-slate-400'
                  }`}
                  title={item.bookmarked ? "Bookmarked Notes Index" : "Bookmark this Resource"}
                >
                  <SmartIcon name="bookmark" size={18} className={item.bookmarked ? 'fill-current' : ''} />
                </button>

                {/* Edit Button Toggle */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    isEditing ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-slate-50'
                  }`}
                >
                  <SmartIcon name="edit" size={16} />
                  <span>{isEditing ? 'Viewing' : 'Edit Note'}</span>
                </button>

                {/* Delete / Archive indexes */}
                <button
                  onClick={handleToggleArchive}
                  className="p-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-amber-600 transition-all"
                  title={item.archived ? "Unarchive notes back on bookshelf" : "Archive to Vault Closet"}
                >
                  <SmartIcon name="archive" size={18} />
                </button>

                <button
                  onClick={() => {
                    onDeleteItem(item.id);
                  }}
                  className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  title="Wipe record"
                >
                  <SmartIcon name="trash" size={18} />
                </button>

                <span className="w-px h-6 bg-slate-200 mx-1"></span>

                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Inner Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* AUTOMATIC PDF REMEMBERING CAPABILITY METADATA BANNER */}
              {subject && (
                <div className="bg-[#FFF5EE] rounded-2xl p-4 border border-[#FF6B00]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SmartIcon name="pdf" className="text-[#FF6B00]" size={20} />
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#1A1A1A]">Subject Classroom reference PDFs</h4>
                        <p className="text-[10px] text-slate-500 font-sans font-medium">
                          {subject.pdfUrl 
                            ? "✓ System remembered your PDF. Eliminate visiting portal keys."
                            : "No PDF added yet. Link a PDF to directly open below."}
                        </p>
                      </div>
                    </div>
                    {subject.pdfUrl ? (
                      <div className="flex gap-2">
                        <a 
                          href={subject.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          referrerPolicy="no-referrer"
                          className="bg-white border text-xs text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm"
                        >
                          <SmartIcon name="externallink" size={12} />
                          <span>View PDF</span>
                        </a>
                        <button 
                          onClick={() => setShowPdfInput(!showPdfInput)}
                          className="text-slate-500 hover:text-[#FF6B00] text-xs font-semibold p-1.5"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowPdfInput(true)}
                        className="bg-[#FF6B00] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:opacity-95"
                      >
                        Add Subject PDF
                      </button>
                    )}
                  </div>
                  
                  {showPdfInput && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 flex gap-2 border-t pt-3"
                    >
                      <input 
                        type="url" 
                        value={pdfInput}
                        onChange={(e) => setPdfInput(e.target.value)}
                        placeholder="Paste PDF link (e.g. from study portal or CodeShelf)"
                        className="flex-1 text-xs border rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                      />
                      <button 
                        onClick={handleSavePdf}
                        className="text-xs bg-[#FF6B00] text-white font-bold px-3 py-1 rounded-lg"
                      >
                        Remember
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Editing Form */}
              {isEditing ? (
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#E5E5E5]">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="border rounded-xl p-3 text-sm font-sans focus:ring-1 focus:ring-[#FF6B00] outline-none"
                    />
                  </div>

                  {item.type !== 'concept' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Resource URL</label>
                      <input
                        type="url"
                        value={editedUrl}
                        onChange={(e) => setEditedUrl(e.target.value)}
                        className="border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Content / Markdown Text</label>
                    <textarea
                      rows={12}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="border rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-[#FF6B00] outline-none bg-slate-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editedTags}
                      onChange={(e) => setEditedTags(e.target.value)}
                      className="border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs font-bold border border-[#E5E5E5] rounded-lg px-4 py-2 hover:bg-slate-50 transition-all text-gray-500"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      className="text-xs font-bold bg-[#FF6B00] text-white rounded-lg px-5 py-2.5 transition-all shadow-sm"
                    >
                      Save Document Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Beautiful view model with support notes split */
                <div className="space-y-6">
                  
                  {/* Title */}
                  <div className="space-y-2">
                    <h1 className="font-sans text-[#1A1A1A] font-extrabold text-2xl leading-snug">
                      {item.title}
                    </h1>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-[#FFF5EE] text-[#FF6B00] border border-[#E5E5E5] text-[10px] font-bold font-sans uppercase tracking-widest px-2.5 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* VIDEO INTEGRATED EMBED VIEWER FOR SIMULTANEOUS NOTETAKING */}
                  {item.type === 'video' && item.url && (
                    <div className="space-y-2">
                      <h3 className="font-sans font-bold text-sm text-[#1A1A1A]">🎬 Direct Classroom Video player</h3>
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                        {item.url.includes('youtube.com/embed') || item.url.includes('youtube-nocookie.com') ? (
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={item.url}
                            title={item.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="absolute inset-0 bg-slate-900 flex flex-col justify-center items-center gap-2 p-5 text-center text-white">
                            <span className="p-3 bg-red-600/20 text-[#FF6B00] rounded-full animate-pulse">
                              <SmartIcon name="video" size={24} />
                            </span>
                            <p className="text-xs font-sans">Embedded YouTube Player requires full URL keys.</p>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              referrerPolicy="no-referrer"
                              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8E3C] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md hover:scale-105 duration-200"
                            >
                              <span>Open Web Stream</span>
                              <SmartIcon name="externallink" size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Content */}
                  <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm space-y-4">
                    <h3 className="font-sans font-bold text-base text-[#1A1A1A] border-b pb-3 flex justify-between items-center">
                      <span>{item.type === 'note' ? '📝 Student Notes & Codes' : '💡 Micro Concept details'}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                        Last opened: {new Date(item.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </h3>
                    
                    {/* Simplified gorgeous markdown preview support inside the web element */}
                    <div className="prose prose-slate max-w-none text-sm font-sans leading-relaxed text-slate-700 space-y-4">
                      {item.content ? (
                        item.content.split('\n').map((line, idx) => {
                          if (line.startsWith('## ')) {
                            return <h4 key={idx} className="font-sans font-bold text-lg text-[#1A1A1A] pt-4 first:pt-0">{line.replace('## ', '')}</h4>;
                          }
                          if (line.startsWith('### ')) {
                            return <h5 key={idx} className="font-sans font-bold text-base text-[#1A1A1A] pt-2">{line.replace('### ', '')}</h5>;
                          }
                          if (line.startsWith('* ') || line.startsWith('- ')) {
                            return <li key={idx} className="ml-4 list-disc text-slate-600">{line.substring(2)}</li>;
                          }
                          if (line.startsWith('1. ') || line.startsWith('2. ')) {
                            return <li key={idx} className="ml-4 list-decimal text-slate-600">{line.substring(3)}</li>;
                          }
                          if (line.trim().startsWith('```')) {
                            return null; // hide markup block indicators
                          }
                          // simple code lines mapping in dark mode boxes
                          if (line.includes('const ') || line.includes('function ') || line.includes('let ') || line.includes('class ')) {
                            return (
                              <pre key={idx} className="bg-[#2d3133] text-[#a8b8ff] font-mono text-xs p-3 rounded-lg overflow-x-auto border-l-4 border-[#FF6B00]">
                                {line}
                              </pre>
                            );
                          }
                          return <p key={idx}>{line}</p>;
                        })
                      ) : (
                        <p className="italic text-slate-400 font-sans">Notes copy is empty. Click "Edit Note" above to capture thoughts.</p>
                      )}
                    </div>
                  </div>

                  {/* Resource footer link */}
                  {item.url && item.type !== 'video' && (
                    <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border">
                      <div className="flex items-center gap-2">
                        <SmartIcon name="externallink" size={16} className="text-[#FF6B00]" />
                        <span className="text-xs font-semibold font-sans text-slate-600 truncate max-w-sm">
                          {item.url}
                        </span>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        referrerPolicy="no-referrer"
                        className="bg-white border hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition-all text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <span>Visit External Source</span>
                        <SmartIcon name="chevronright" size={12} />
                      </a>
                    </div>
                  )}

                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
