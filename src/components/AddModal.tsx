/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, LibraryItem } from '../types';
import SmartIcon from './SmartIcon';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (newSubject: Omit<Subject, 'id' | 'progress' | 'studyHours' | 'favorite'>) => void;
  onAddItem: (newItem: Omit<LibraryItem, 'id' | 'createdAt' | 'lastOpenedAt' | 'archived'>) => void;
  preselectedSubjectId?: string | null;
  initialTab?: 'note' | 'video' | 'concept' | 'subject';
}

type AddTab = 'note' | 'video' | 'concept' | 'subject';

export default function AddModal({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onAddItem,
  preselectedSubjectId = null,
  initialTab = 'note'
}: AddModalProps) {
  const [activeTab, setActiveTab] = useState<AddTab>('note');
  
  // Subject State
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('Frontend Mastery');
  const [subjectColor, setSubjectColor] = useState('bg-[#FF6B00]');
  const [subjectIcon, setSubjectIcon] = useState('Terminal');
  const [subjectPdf, setSubjectPdf] = useState('');
  const [isSubjectPdfLocal, setIsSubjectPdfLocal] = useState(false);
  const [isLocalPdfReading, setIsLocalPdfReading] = useState(false);
  const [localPdfName, setLocalPdfName] = useState('');

  const handleLocalPdfSelect = (file: File) => {
    setIsLocalPdfReading(true);
    setLocalPdfName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setSubjectPdf(base64Url);
      setIsLocalPdfReading(false);
    };
    reader.onerror = () => {
      alert("Failed to read local PDF file.");
      setIsLocalPdfReading(false);
    };
    reader.readAsDataURL(file);
  };

  // Item State (Shared/Note)
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubjectId, setItemSubjectId] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [itemBookmarked, setItemBookmarked] = useState(false);

  // Sync props state whenever the modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (preselectedSubjectId) {
        setItemSubjectId(preselectedSubjectId);
      } else {
        setItemSubjectId('');
      }
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, preselectedSubjectId, initialTab]);

  const colors = [
    { class: 'bg-[#FF6B00]', label: 'Vibrant Orange' },
    { class: 'bg-[#1A1A1A]', label: 'Midnight Black' },
    { class: 'bg-[#4B5563]', label: 'Slate Gray' },
    { class: 'bg-[#2563EB]', label: 'Cobalt Blue' },
    { class: 'bg-[#059669]', label: 'Emerald Mint' },
    { class: 'bg-[#DB2777]', label: 'Crimson Rose' },
    { class: 'bg-[#D97706]', label: 'Amber Gold' }
  ];

  const icons = [
    { id: 'Terminal', label: 'Terminal / Code' },
    { id: 'Layers', label: 'Layers / Atom' },
    { id: 'Database', label: 'Database / API' },
    { id: 'Brush', label: 'Figma / Brush' },
    { id: 'GitFork', label: 'Algorithms / Fork' },
    { id: 'BookOpen', label: 'Class Note Book' },
    { id: 'Lightbulb', label: 'Concept Light' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'subject') {
      if (!subjectTitle.trim()) return;
      onAddSubject({
        title: subjectTitle,
        category: subjectCategory,
        coverColor: subjectColor,
        icon: subjectIcon,
        tags: [subjectCategory],
        pdfUrl: subjectPdf.trim() || undefined
      });
      // reset
      setSubjectTitle('');
      setSubjectPdf('');
    } else {
      if (!itemTitle.trim() || !itemSubjectId) return;
      
      let finalUrl = itemUrl;
      // If it's a YouTube video, make sure it is converted to embed
      if (activeTab === 'video' && itemUrl.includes('youtube.com/watch?v=')) {
        const vidId = itemUrl.split('v=')[1]?.split('&')[0];
        if (vidId) finalUrl = `https://www.youtube.com/embed/${vidId}`;
      } else if (activeTab === 'video' && itemUrl.includes('youtu.be/')) {
        const vidId = itemUrl.split('youtu.be/')[1]?.split('?')[0];
        if (vidId) finalUrl = `https://www.youtube.com/embed/${vidId}`;
      }

      onAddItem({
        subjectId: itemSubjectId,
        type: activeTab,
        title: itemTitle,
        url: finalUrl.trim() || undefined,
        content: itemContent,
        tags: itemTags.split(',').map(t => t.trim()).filter(Boolean),
        bookmarked: itemBookmarked
      });

      // reset
      setItemTitle('');
      setItemUrl('');
      setItemContent('');
      setItemTags('');
      setItemBookmarked(false);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Glass Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 border border-[#eceef0]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8E3C] p-5 rounded-t-2xl flex justify-between items-center text-white">
              <div>
                <h2 className="font-sans text-xl font-bold tracking-tight">Add To Your Knowledge Library</h2>
                <p className="text-white/80 text-xs">Fill the vault records to study offline anywhere</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Selection Select Tabs */}
            <div className="flex border-b border-[#E5E5E5] bg-gray-50">
              {(['note', 'video', 'concept', 'subject'] as AddTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 text-center outline-none ${
                    activeTab === tab
                      ? 'border-[#FF6B00] text-[#FF6B00] bg-white font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-[#FF6B00] hover:bg-gray-100'
                  }`}
                >
                  {tab === 'subject' ? '📚 New Book/Subject' : `${tab === 'note' ? '📝' : tab === 'video' ? '🎬' : '💡'} Save ${tab}`}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              
              {activeTab === 'subject' ? (
                <>
                  {/* Create Subject Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Subject / Book Cover Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master React Hooks, Backend Systems"
                      value={subjectTitle}
                      onChange={(e) => setSubjectTitle(e.target.value)}
                      className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Study Domain Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Mastery, Backend Systems"
                        value={subjectCategory}
                        onChange={(e) => setSubjectCategory(e.target.value)}
                        className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-500 uppercase">Primary PDF Document (Optional)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSubjectPdfLocal(!isSubjectPdfLocal);
                            setSubjectPdf('');
                            setLocalPdfName('');
                          }}
                          className="text-[10px] text-[#FF6B00] font-bold uppercase hover:underline"
                        >
                          {isSubjectPdfLocal ? "Paste URL Link instead" : "Upload Local file instead"}
                        </button>
                      </div>

                      {isSubjectPdfLocal ? (
                        <div className="border border-[#E5E5E5] rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SmartIcon name="cloud_upload" className="text-slate-400" size={18} />
                            <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
                              {localPdfName || "No PDF file selected"}
                            </span>
                          </div>
                          <div>
                            <input
                              id="modal-pdf-file-picker"
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLocalPdfSelect(file);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById('modal-pdf-file-picker')?.click()}
                              className="text-[10px] bg-white border border-[#E5E5E5] px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:text-[#FF6B00]"
                            >
                              Browse File
                            </button>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="url"
                          placeholder="https://notes.sheryians.com/...pdf"
                          value={subjectPdf}
                          onChange={(e) => setSubjectPdf(e.target.value)}
                          className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00]"
                          title="We will automatically remember this location for classroom sessions!"
                        />
                      )}
                      
                      {isLocalPdfReading && (
                        <span className="text-[10px] text-[#FF6B00] font-bold animate-pulse">Reading & compiling file data...</span>
                      )}
                      {!isLocalPdfReading && subjectPdf && isSubjectPdfLocal && (
                        <span className="text-[10px] text-emerald-500 font-bold">✓ PDF local attachment attached successfully!</span>
                      )}
                    </div>
                  </div>

                  {/* Aesthetic Color Selection picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Choose Cover Binder Jacket</label>
                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((c) => (
                        <button
                          key={c.class}
                          type="button"
                          onClick={() => setSubjectColor(c.class)}
                          className={`w-10 h-14 rounded-l-md rounded-r-xs relative transition-all ${c.class} ${
                            subjectColor === c.class 
                              ? 'ring-2 ring-offset-2 ring-[#FF6B00] scale-105 shadow-md' 
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          title={c.label}
                        >
                          <div className="absolute inset-y-0 right-0 w-1 bg-black/10"></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Subject Graphic Emblem</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {icons.map((ic) => (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => setSubjectIcon(ic.id)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-xs font-bold ${
                            subjectIcon === ic.id
                              ? 'bg-[#FFF5EE] border-[#FF6B00] text-[#FF6B00]'
                              : 'border-[#E5E5E5] text-gray-500 hover:bg-slate-50'
                          }`}
                        >
                          <SmartIcon name={ic.id} size={16} />
                          <span className="text-[9px] truncate w-full uppercase text-center">{ic.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Add note/video/concept Items properties */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Select Shelf Book (Subject)</label>
                      <select
                        required
                        value={itemSubjectId}
                        onChange={(e) => setItemSubjectId(e.target.value)}
                        className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none bg-white"
                      >
                        <option value="">-- Choose Subject Book --</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        {activeTab === 'note' ? 'Note Item Title' : activeTab === 'video' ? 'Video Vault Title' : 'Concept Identifier'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          activeTab === 'note' 
                            ? 'e.g. Prototype chains & functions' 
                            : activeTab === 'video' 
                            ? 'e.g. Master CSS layouts course' 
                            : 'e.g. Currying in JS'
                        }
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
                        className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                      />
                    </div>
                  </div>

                  {activeTab !== 'concept' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        {activeTab === 'video' ? 'YouTube / Stream URL Link' : 'Study Resource URL (Optional notes link)'}
                      </label>
                      <input
                        type="url"
                        placeholder={
                          activeTab === 'video' 
                            ? 'https://www.youtube.com/watch?v=...' 
                            : 'https://notes.sheryians.com/pdf/resources'
                        }
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
                        className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      {activeTab === 'note' ? 'Study Markdown Notes (Supports clean notes content)' : 'Concept Summary / Quick Explanation'}
                    </label>
                    <textarea
                      rows={6}
                      placeholder={
                        activeTab === 'note'
                          ? '## My Lecture Learnings\n1. Always initialize variables before scope call.\n2. Prototype objects are linked live.'
                          : 'Write down definitions, key coding patterns, or reference points here.'
                      }
                      value={itemContent}
                      onChange={(e) => setItemContent(e.target.value)}
                      className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Custom tags (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. ES6, Lexical, ReactDocs"
                        value={itemTags}
                        onChange={(e) => setItemTags(e.target.value)}
                        className="border border-[#E5E5E5] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="bookmark"
                        checked={itemBookmarked}
                        onChange={(e) => setItemBookmarked(e.target.checked)}
                        className="w-5 h-5 rounded text-[#FF6B00] border-gray-300 focus:ring-[#FF6B00]"
                      />
                      <label htmlFor="bookmark" className="text-sm font-semibold text-gray-600 cursor-pointer">
                        Add to favorited bookmarks index
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5] mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#E5E5E5] text-gray-600 text-sm font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8E3C] text-white text-sm font-bold shadow-md hover:opacity-95 transition-all"
                >
                  {activeTab === 'subject' ? 'Create Book Jacket' : 'Save To Vault'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
