/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Book3D from './components/Book3D';
import AddModal from './components/AddModal';
import ItemDrawer from './components/ItemDrawer';
import SmartIcon from './components/SmartIcon';
import { Subject, LibraryItem } from './types';
import { 
  openDB, 
  seedDBIfEmpty, 
  getAllSubjects, 
  saveSubject, 
  deleteSubject, 
  getAllItems, 
  saveItem, 
  deleteItem 
} from './utils/db';

export default function App() {
  // DB & Lists State
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // App Navigation & Filters
  const [activeTab, setActiveTab] = useState<string>('home'); // home, subjects, videos, concepts, archive, settings, support
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Home bookshelf view layout preference
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer / Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialTab, setAddModalInitialTab] = useState<'note' | 'video' | 'concept' | 'subject'>('note');
  const [addModalPreselectedSubjectId, setAddModalPreselectedSubjectId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Collapsible sidebar state & Drag-drop PDF uploads
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => localStorage.getItem('sh_sidebarCollapsed') === 'true');
  const [pdfModeTab, setPdfModeTab] = useState<'upload' | 'link'>('upload');
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Stats Counters
  const [notificationCount, setNotificationCount] = useState(3);
  const [userName, setUserName] = useState(() => localStorage.getItem('sh_userName') || 'John Doe');
  const [userTitle, setUserTitle] = useState(() => localStorage.getItem('sh_userTitle') || 'Professional Learner');
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('sh_userAvatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256');

  // Custom Confirm Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void | Promise<void>;
    title?: string;
  } | null>(null);

  const triggerConfirm = (message: string, onConfirm: () => void | Promise<void>, title = "Confirm Action") => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm,
      title
    });
  };

  useEffect(() => {
    localStorage.setItem('sh_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('sh_userTitle', userTitle);
  }, [userTitle]);

  useEffect(() => {
    localStorage.setItem('sh_userAvatar', userAvatar);
  }, [userAvatar]);

  // Subject Workspace editing states
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subEditTitle, setSubEditTitle] = useState('');
  const [subEditCategory, setSubEditCategory] = useState('');
  const [subEditCoverColor, setSubEditCoverColor] = useState('');
  const [subEditTags, setSubEditTags] = useState('');

  // Initialization: load IndexedDB and state on mount
  useEffect(() => {
    async function initDatabase() {
      try {
        const db = await openDB();
        setDbInstance(db);
        await seedDBIfEmpty(db);
        await reloadState();
      } catch (err) {
        console.error('Failed to init IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    }
    initDatabase();
  }, []);

  const reloadState = async () => {
    const sList = await getAllSubjects();
    const iList = await getAllItems();
    setSubjects(sList);
    setItems(iList);
  };

  // Subject Detail dynamic tracker
  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  // Derived Statistics
  const stats = useMemo(() => {
    const activeItems = items.filter(it => !it.archived);
    const totalBooks = subjects.length;
    const hoursStudied = subjects.reduce((sum, s) => sum + (s.studyHours || 0), 0);
    const notesSaved = activeItems.filter(it => it.type === 'note').length;
    return { totalBooks, hoursStudied, notesSaved };
  }, [subjects, items]);

  // Filtering: Global Search Logic (matching subjects OR items)
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const cleanQuery = searchQuery.toLowerCase();
    return subjects.filter(s => 
      s.title.toLowerCase().includes(cleanQuery) ||
      s.category.toLowerCase().includes(cleanQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(cleanQuery))
    );
  }, [subjects, searchQuery]);

  const filteredItems = useMemo(() => {
    const active = items.filter(it => !it.archived);
    if (!searchQuery.trim()) return active;
    const cleanQuery = searchQuery.toLowerCase();
    return active.filter(it => 
      it.title.toLowerCase().includes(cleanQuery) ||
      it.content.toLowerCase().includes(cleanQuery) ||
      it.tags.some(tag => tag.toLowerCase().includes(cleanQuery))
    );
  }, [items, searchQuery]);

  // Horizontal Scroll Index: Recently Opened elements
  const recentlyOpenedItems = useMemo(() => {
    return items
      .filter(it => !it.archived)
      .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
      .slice(0, 4);
  }, [items]);

  // Helper actions: subjects create/update
  const handleAddSubject = async (newSub: Omit<Subject, 'id' | 'progress' | 'studyHours' | 'favorite'>) => {
    const fresh: Subject = {
      ...newSub,
      id: 'sub-' + Date.now(),
      progress: 0,
      studyHours: 0,
      favorite: false,
      lastOpenedAt: Date.now()
    };
    await saveSubject(fresh);
    await reloadState();
  };

  const handleDeleteSubject = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const target = subjects.find(s => s.id === id);
    const title = target ? target.title : "this Subject/Book";
    triggerConfirm(
      `Should I delete this book or not? This will permanently erase "${title}" along with all its notes, videos, and concepts!`,
      async () => {
        await deleteSubject(id);
        if (selectedSubjectId === id) {
          setSelectedSubjectId(null);
          setActiveTab('home');
        }
        await reloadState();
      },
      "Delete Subject Book"
    );
  };

  const handleAddLibraryItem = async (newIt: Omit<LibraryItem, 'id' | 'createdAt' | 'lastOpenedAt' | 'archived'>) => {
    const fresh: LibraryItem = {
      ...newIt,
      id: 'item-' + Date.now(),
      archived: false,
      createdAt: Date.now(),
      lastOpenedAt: Date.now()
    };
    await saveItem(fresh);
    
    // Auto-progress calculation based on item completion types (optional)
    if (newIt.subjectId) {
      await updateSubjectProgress(newIt.subjectId);
    }
    await reloadState();
  };

  const handleUpdateItem = async (updated: LibraryItem) => {
    await saveItem(updated);
    if (updated.subjectId) {
      await updateSubjectProgress(updated.subjectId);
    }
    await reloadState();
    
    // Sync current viewer
    if (selectedItem?.id === updated.id) {
      setSelectedItem(updated);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const target = items.find(it => it.id === id);
    if (!target) return;
    triggerConfirm(
      `Are you sure you want to delete "${target.title}"? This will permanently erase it from IndexedDB.`,
      async () => {
        await deleteItem(id);
        if (selectedItem?.id === id) {
          setSelectedItem(null);
          setIsDrawerOpen(false);
        }
        await updateSubjectProgress(target.subjectId);
        await reloadState();
      },
      "Delete Library Item"
    );
  };

  const handleUpdatePdfUrl = async (subjectId: string, pdfUrl: string) => {
    const target = subjects.find(s => s.id === subjectId);
    if (target) {
      const updated = { ...target, pdfUrl, lastOpenedAt: Date.now() };
      await saveSubject(updated);
      await reloadState();
    }
  };

  const handleLocalPdfUpload = async (subjectId: string, file: File) => {
    setIsPdfLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Url = e.target?.result as string;
        await handleUpdatePdfUrl(subjectId, base64Url);
        setIsPdfLoading(false);
      };
      reader.onerror = () => {
        alert("Failed to read local PDF file.");
        setIsPdfLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsPdfLoading(false);
    }
  };

  const handleFavoriteToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = subjects.find(s => s.id === id);
    if (target) {
      const updated = { ...target, favorite: !target.favorite };
      await saveSubject(updated);
      await reloadState();
    }
  };

  // Add study hours helper (+1 hour logger feedback)
  const handleAddStudyHours = async (subjectId: string, hours = 1) => {
    const target = subjects.find(s => s.id === subjectId);
    if (target) {
      const updated = { 
        ...target, 
        studyHours: (target.studyHours || 0) + hours,
        lastOpenedAt: Date.now() 
      };
      await saveSubject(updated);
      await reloadState();
    }
  };

  const updateSubjectProgress = async (subjectId: string) => {
    const target = subjects.find(s => s.id === subjectId);
    if (!target) return;
    
    const elements = items.filter(it => it.subjectId === subjectId && !it.archived);
    if (elements.length === 0) return;
    
    // simple heuristic progress based on bookmark/notes elements
    const watched = elements.filter(it => it.type === 'video' && (it.videoProgress || 0) > 0).length;
    const bookmarkedCount = elements.filter(it => it.bookmarked).length;
    const average = Math.min(100, Math.round(((watched + bookmarkedCount + 1) / (elements.length + 1)) * 100));
    
    const updated = {
      ...target,
      progress: average
    };
    await saveSubject(updated);
  };

  const handleOpenItem = async (item: LibraryItem) => {
    // track last opened
    const updated = { ...item, lastOpenedAt: Date.now() };
    await saveItem(updated);
    setSelectedItem(updated);
    setIsDrawerOpen(true);
    
    // update parent subject last opened
    const parentSub = subjects.find(s => s.id === item.subjectId);
    if (parentSub) {
      await saveSubject({ ...parentSub, lastOpenedAt: Date.now() });
    }
    await reloadState();
  };

  const handleOpenSubject = async (sub: Subject) => {
    setSelectedSubjectId(sub.id);
    setActiveTab('subject-detail');
    // update last opened
    await saveSubject({ ...sub, lastOpenedAt: Date.now() });
    await reloadState();
  };

  // Setup sample reset key for clean prototyping testing
  const resetAppToSeed = async () => {
    triggerConfirm(
      "Are you sure you want to restore default items and wipe current custom modifications?",
      async () => {
        const db = await openDB();
        // Wait database transactions
        const transaction = db.transaction(['subjects', 'items'], 'readwrite');
        transaction.objectStore('subjects').clear();
        transaction.objectStore('items').clear();
        transaction.oncomplete = async () => {
          await seedDBIfEmpty(db);
          await reloadState();
        };
      },
      "Database Reset"
    );
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#FF6B00]/10">
      
      {/* Dynamic Navigation Header wrapper */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tbl) => { setSelectedSubjectId(null); setActiveTab(tbl); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddNewClick={() => setIsAddModalOpen(true)}
        notificationCount={notificationCount}
        setNotificationCount={setNotificationCount}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => {
          setIsSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sh_sidebarCollapsed', String(next));
            return next;
          });
        }}
      />

      {/* Main Container structure layout - desktop side rail split */}
      <div className="flex">
        
        {/* Sidebar Component */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tabId) => { setSelectedSubjectId(null); setActiveTab(tabId); }}
          onAddNewClick={() => setIsAddModalOpen(true)}
          totalBooks={stats.totalBooks}
          notesSaved={stats.notesSaved}
          userName={userName}
          userTitle={userTitle}
          userAvatar={userAvatar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Global Page Canvas Area */}
        <main className={`flex-1 ${isSidebarCollapsed ? 'md:ml-0' : 'md:ml-64'} pt-20 pb-24 md:pb-8 px-6 min-h-screen max-w-7xl mx-auto w-full transition-all duration-300`}>
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-3"
              >
                <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-[#fd8a42] animate-spin"></div>
                <p className="text-[#757684] text-xs font-bold uppercase tracking-widest font-sans">Booting indexed databases...</p>
              </motion.div>
            ) : searchQuery.trim() ? (
              /* Global Search Overlay block */
              <motion.section 
                key="search-overlay"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-[#eceef0] pb-4 flex justify-between items-center bg-white/70 backdrop-blur p-4 rounded-xl">
                  <div>
                    <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900">Search Results</h1>
                    <p className="text-xs text-slate-500">Showing matches for "{searchQuery}"</p>
                  </div>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="bg-slate-100 hover:bg-slate-200 text-[#444653] font-bold text-xs px-3 py-1.5 rounded-lg"
                  >
                    Clear Search
                  </button>
                </div>

                {/* Match Subjects/Books */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-sm uppercase text-slate-400 tracking-wider">Matching Books ({filteredSubjects.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredSubjects.map(sub => (
                      <Book3D
                        key={sub.id}
                        subject={sub}
                        onClick={() => handleOpenSubject(sub)}
                        onFavoriteToggle={(e) => handleFavoriteToggle(sub.id, e)}
                        onDelete={(e) => handleDeleteSubject(sub.id, e)}
                      />
                    ))}
                    {filteredSubjects.length === 0 && (
                      <p className="text-slate-400 italic text-xs">No books matching key titles.</p>
                    )}
                  </div>
                </div>

                {/* Match Items */}
                <div className="space-y-3 pt-4">
                  <h3 className="font-serif font-black text-sm uppercase text-slate-400 tracking-wider">Matching Notes, Videos & Concepts ({filteredItems.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map(item => {
                      const parentSub = subjects.find(s => s.id === item.subjectId);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenItem(item)}
                          className="bg-white p-4 rounded-xl border border-[#E5E5E5] hover:border-[#FF6B00]/40 transition-all flex justify-between items-center cursor-pointer shadow-xs group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="p-2 bg-[#FFF5EE] text-[#FF6B00] rounded-lg">
                              <SmartIcon name={item.type === 'note' ? 'stickynote' : item.type === 'video' ? 'video' : 'lightbulb'} size={16} />
                            </span>
                            <div className="overflow-hidden">
                              <h4 className="font-sans font-bold text-sm text-[#0F172A] group-hover:text-[#00288e] truncate">{item.title}</h4>
                              <p className="text-[10px] text-slate-400 truncate font-semibold uppercase">{parentSub?.title || 'General Vault'}</p>
                            </div>
                          </div>
                          <SmartIcon name="chevronright" size={16} className="text-slate-300" />
                        </div>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <p className="text-slate-400 italic text-xs">No learning snippets matching definitions.</p>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : (
              /* Core Navigation Views mapping */
              <>
                {/* 1. HOME VIEW */}
                {activeTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Top Stats Dashboard row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="bg-white border border-[#E5E5E5] border-b-2 border-b-[#FF6B00] p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-transform hover:scale-[1.01]">
                        <div className="w-12 h-12 rounded-xl bg-[#FFF5EE] flex items-center justify-center text-[#FF6B00]">
                          <SmartIcon name="menu_book" size={24} />
                        </div>
                        <div>
                          <h4 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Total Books</h4>
                          <p className="font-sans text-2xl font-extrabold text-[#1A1A1A]">{stats.totalBooks}</p>
                        </div>
                      </div>

                      <div className="bg-white border border-[#E5E5E5] border-b-2 border-b-slate-300 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-transform hover:scale-[1.01]">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-[#1A1A1A]">
                          <SmartIcon name="sticky_note_2" size={24} />
                        </div>
                        <div>
                          <h4 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Notes Saved</h4>
                          <p className="font-sans text-2xl font-extrabold text-[#1A1A1A]">{stats.notesSaved}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recently Opened Items slider/list */}
                    {recentlyOpenedItems.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-sans text-lg font-bold tracking-tight text-[#1A1A1A] flex items-center gap-1.5">
                            <SmartIcon name="history" size={18} className="text-[#FF6B00]" />
                            <span>Recently Studied</span>
                          </h2>
                          <button 
                            onClick={() => {
                              // alert history details summary
                              const count = items.length;
                              alert(`Your workspace currently hosts ${count} catalogued learning components.`);
                            }}
                            className="text-[#FF6B00] text-xs font-bold hover:underline"
                          >
                            Summarize History
                          </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                          {recentlyOpenedItems.map((item) => {
                            const parentSub = subjects.find(s => s.id === item.subjectId);
                            return (
                              <motion.div
                                whileHover={{ y: -3 }}
                                onClick={() => handleOpenItem(item)}
                                key={item.id}
                                className="flex-shrink-0 w-64 bg-white p-3.5 rounded-2xl border border-[#E5E5E5] flex items-center gap-3 cursor-pointer hover:border-[#FF6B00]/30 hover:shadow-xs transition-all duration-200"
                              >
                               <div 
                                 className={`w-11 h-15 ${parentSub?.coverColor || 'bg-[#FF6B00]'} rounded-r-md rounded-l-xs shadow-sm flex flex-col justify-center items-center text-center p-1 overflow-hidden shrink-0`}
                                >
                                  <span className="text-[7px] font-black text-white uppercase tracking-tighter leading-none line-clamp-2">
                                    {parentSub?.title || 'GEN'}
                                  </span>
                                </div>
                                <div className="overflow-hidden flex-1">
                                  <h4 className="font-sans font-bold text-xs text-[#0F172A] truncate" title={item.title}>
                                    {item.title}
                                  </h4>
                                  <p className="text-[9px] uppercase tracking-tight text-[#FF6B00] font-bold mt-0.5">
                                    {item.type}
                                  </p>
                                  <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                    <div 
                                      className="bg-[#FF6B00] h-full rounded-full" 
                                      style={{ width: `${parentSub?.progress || 10}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Shelf Title & Layout options */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-b border-[#E5E5E5] pb-4 gap-4">
                      <div>
                        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                          My Bookshelf
                        </h1>
                        <p className="text-gray-500 text-xs font-sans mt-0.5">
                          Organize your intellectual evolution with customized virtual binders.
                        </p>
                      </div>
                      <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'grid'
                              ? 'bg-white text-[#FF6B00] shadow-sm'
                              : 'text-gray-500 hover:text-[#FF6B00]'
                          }`}
                        >
                          <SmartIcon name="grid" size={14} />
                          <span>Grid View</span>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'list'
                              ? 'bg-white text-[#FF6B00] shadow-sm'
                              : 'text-gray-500 hover:text-[#FF6B00]'
                          }`}
                        >
                          <SmartIcon name="list" size={14} />
                          <span>List View</span>
                        </button>
                      </div>
                    </div>

                    {/* VIRTUAL SHELF DISPLAY BOX */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
                        {subjects.map((sub) => (
                          <Book3D
                            key={sub.id}
                            subject={sub}
                            onClick={() => handleOpenSubject(sub)}
                            onFavoriteToggle={(e) => handleFavoriteToggle(sub.id, e)}
                            onDelete={(e) => handleDeleteSubject(sub.id, e)}
                          />
                        ))}
                        
                        {/* Empty Shelf prompt */}
                        {subjects.length === 0 && (
                          <div className="col-span-full border-2 border-dashed border-[#E5E5E5] rounded-2xl p-8 py-12 text-center text-gray-400 bg-white">
                            <SmartIcon name="menu_book" size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm font-sans">No subject books saved yet.</p>
                            <button
                              onClick={() => setIsAddModalOpen(true)}
                              className="mt-3 bg-[#FF6B00] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all duration-150"
                            >
                              Create your first Binder
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Flat Subject list view row items */
                      <div className="flex flex-col gap-3">
                        {subjects.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => handleOpenSubject(sub)}
                            className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center justify-between hover:border-[#FF6B00]/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-14 ${sub.coverColor || 'bg-[#FF6B00]'} rounded shadow-xs flex items-center justify-center text-white`}>
                                <SmartIcon name={sub.icon} size={16} />
                              </div>
                              <div>
                                <h3 className="font-sans font-bold text-sm text-[#1A1A1A] group-hover:text-[#FF6B00]">{sub.title}</h3>
                                <p className="text-xs text-slate-400">{sub.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <span className="text-xs font-black text-[#FF6B00]">{sub.progress}%</span>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Progress</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubject(sub.id, e);
                                }}
                                className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer relative z-40 shrink-0"
                                title="Delete this subject book"
                              >
                                <SmartIcon name="delete" size={14} />
                              </button>
                              <SmartIcon name="chevronright" size={16} className="text-slate-300 pointer-events-none" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Virtual Shelf Line decoration separator */}
                    <div className="relative pt-6 flex items-center justify-center gap-4">
                      <div className="h-px flex-grow bg-[#E5E5E5]"></div>
                      <div className="w-3.5 h-3.5 bg-[#FFF5EE] border border-[#FF6B00] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#FF6B00]"></div>
                      </div>
                      <div className="h-px flex-grow bg-[#E5E5E5]"></div>
                    </div>
                  </motion.div>
                )}

                {/* 2. SUBJECTS LISTING VIEW */}
                {activeTab === 'subjects' && (
                  <motion.div
                    key="subjects"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="font-sans text-3xl font-bold tracking-tight text-[#1A1A1A]">Curriculum Subjects</h1>
                      <p className="text-gray-500 text-xs mt-1">Browse and manage folders containing your note lectures, video repositories, and study goals.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {subjects.map((sub) => {
                        const subCount = items.filter(it => it.subjectId === sub.id && !it.archived).length;
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => handleOpenSubject(sub)}
                            className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex flex-col justify-between hover:border-[#FF6B00]/30 hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className={`p-2.5 rounded-xl ${sub.coverColor || 'bg-[#FF6B00]'} text-white`}>
                                  <SmartIcon name={sub.icon} size={18} />
                                </div>
                                <span className="bg-[#FFF5EE] px-2.5 py-1 rounded text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">
                                  {sub.category}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-sans font-extrabold text-base text-[#1A1A1A] group-hover:text-[#FF6B00]">{sub.title}</h3>
                                <p className="text-xs text-slate-400 mt-1">{subCount} catalogued micro components</p>
                              </div>
                            </div>

                            <div className="border-t pt-4 mt-6 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#FF6B00]">{sub.studyHours}h Studied</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubject(sub.id, e);
                                  }}
                                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px] font-bold flex items-center gap-0.5 relative z-40"
                                  title="Delete this entire subject book"
                                >
                                  <SmartIcon name="delete" size={10} />
                                  <span>Delete</span>
                                </button>
                              </div>
                              <span className="text-xs font-bold text-[#FF6B00] flex items-center gap-1 group-hover:translate-x-1 duration-150">
                                <span>Study Binder</span>
                                <SmartIcon name="chevronright" size={12} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 3. SUBJECT DETAILED WORKSPACE VIEW */}
                {activeTab === 'subject-detail' && selectedSubject && (
                  <motion.div
                    key="subject-detail"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="max-w-4xl mx-auto space-y-8 pb-10"
                  >
                    {/* Header bar controls */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <button
                        onClick={() => { setSelectedSubjectId(null); setActiveTab('home'); setIsEditingSubject(false); }}
                        className="text-[#FF6B00] text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-all font-sans cursor-pointer"
                      >
                        ← Back to Bookshelf
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSubEditTitle(selectedSubject.title);
                            setSubEditCategory(selectedSubject.category);
                            setSubEditCoverColor(selectedSubject.coverColor || 'bg-[#FF6B00]');
                            setSubEditTags(selectedSubject.tags.join(', '));
                            setIsEditingSubject(true);
                          }}
                          className="text-gray-500 hover:text-[#FF6B00] font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all cursor-pointer font-sans"
                          title="Edit this book information"
                        >
                          <SmartIcon name="edit" size={12} />
                          <span>Edit Book Info</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteSubject(selectedSubject.id, e)}
                          className="text-gray-400 hover:text-red-500 font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer font-sans"
                          title="Delete this entire subject book"
                        >
                          <SmartIcon name="delete" size={12} />
                          <span>Delete Book</span>
                        </button>
                      </div>
                    </div>

                    {/* Book Core Title Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className={`w-16 h-22 rounded-l-md rounded-r-lg ${selectedSubject.coverColor || 'bg-[#FF6B00]'} flex flex-col justify-between p-2 relative shadow-xs shrink-0 overflow-hidden`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/15 z-20"></div>
                        <span className="p-0.5 rounded bg-[#ffffff20] text-white w-fit">
                          <SmartIcon name={selectedSubject.icon} size={10} className="text-white" />
                        </span>
                        <div className="text-[5px] text-white font-black uppercase tracking-widest truncate">{selectedSubject.category}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase tracking-widest text-[#FF6B00] font-black">{selectedSubject.category || 'Portfolio'}</span>
                        </div>
                        <h1 className="font-sans font-extrabold text-[#1A1A1A] text-2xl tracking-tight leading-none">{selectedSubject.title}</h1>
                        <p className="text-gray-500 text-xs font-sans">Manage classroom notes, linked videos, core definitions, and PDF resources.</p>
                      </div>
                    </div>                    {isEditingSubject ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4 max-w-xl mx-auto font-sans"
                      >
                        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <SmartIcon name="edit" className="text-[#FF6B00]" size={18} />
                          <span>Edit Subject Book Info</span>
                        </h2>

                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Book Title</label>
                            <input
                              type="text"
                              value={subEditTitle}
                              onChange={(e) => setSubEditTitle(e.target.value)}
                              className="border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Category / Subject area</label>
                            <input
                              type="text"
                              value={subEditCategory}
                              onChange={(e) => setSubEditCategory(e.target.value)}
                              className="border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Book Cover Palette Color</label>
                            <div className="flex gap-2.5 flex-wrap pt-1">
                              {[
                                'bg-[#FF6B00]', // primary warm orange
                                'bg-[#1E293B]', // Slate
                                'bg-[#1E40AF]', // Indigo Blue
                                'bg-[#0F766E]', // Teal
                                'bg-[#B45309]', // Warm Amber/Brown
                                'bg-[#BE123C]', // Rose Red
                                'bg-[#4D7C0F]', // Lime Green
                                'bg-[#6D28D9]', // Purple
                              ].map((colorPreset) => (
                                <button
                                  key={colorPreset}
                                  type="button"
                                  onClick={() => setSubEditCoverColor(colorPreset)}
                                  className={`w-8 h-8 rounded-full ${colorPreset} border-2 transition-all ${
                                    subEditCoverColor === colorPreset 
                                      ? 'border-[#FF6B00] scale-110 shadow-md ring-2 ring-[#FF6B00]/40' 
                                      : 'border-transparent hover:scale-105'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={subEditTags}
                              onChange={(e) => setSubEditTags(e.target.value)}
                              className="border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FF6B00] outline-none"
                              placeholder="e.g. JavaScript, ES6, OOP"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                          <button
                            onClick={() => setIsEditingSubject(false)}
                            className="text-xs font-bold border rounded-lg px-4 py-2 hover:bg-slate-50 transition-all text-gray-500 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              const updatedSubject = {
                                ...selectedSubject,
                                title: subEditTitle,
                                category: subEditCategory,
                                coverColor: subEditCoverColor,
                                tags: subEditTags.split(',').map(tag => tag.trim()).filter(Boolean)
                              };
                              await saveSubject(updatedSubject);
                              await reloadState();
                              setIsEditingSubject(false);
                            }}
                            className="text-xs font-bold bg-[#FF6B00] text-white rounded-lg px-5 py-2.5 transition-all shadow-sm cursor-pointer hover:bg-[#e05e00]"
                          >
                            Save Book Info
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* Two Section Minimalist Layout Grid */
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Left Side: Minimal Study Log & PDF panel */}
                        <div className="space-y-6">
                          
                          {/* Interactive PDF section */}
                          <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] space-y-3 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Course Reference PDF</span>
                              {selectedSubject.pdfUrl && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
                            </div>

                            {selectedSubject.pdfUrl ? (
                              <div className="space-y-2">
                                <a 
                                  href={selectedSubject.pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  referrerPolicy="no-referrer"
                                  className="w-full bg-[#FFF5EE] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-[#FFF0E5] transition-all"
                                >
                                  <SmartIcon name="pdf" size={12} />
                                  <span className="truncate flex-1 text-left">
                                    {selectedSubject.pdfUrl.startsWith('data:') ? 'Read Uploaded PDF' : 'Read Saved PDF Link'}
                                  </span>
                                </a>
                                <button
                                  onClick={() => {
                                    triggerConfirm(
                                      "Are you sure you want to remove the reference PDF?",
                                      async () => {
                                        await handleUpdatePdfUrl(selectedSubject.id, '');
                                      },
                                      "Remove PDF"
                                    );
                                  }}
                                  className="w-full text-[10px] text-gray-400 hover:text-red-500 transition-all font-semibold uppercase text-center cursor-pointer font-sans"
                                >
                                  Delete Reference PDF
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {/* Option selector tabs */}
                                <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold uppercase transition-all">
                                  <button
                                    onClick={() => setPdfModeTab('upload')}
                                    className={`py-1 rounded-md transition-all cursor-pointer ${pdfModeTab === 'upload' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                  >
                                    Upload PDF File
                                  </button>
                                  <button
                                    onClick={() => setPdfModeTab('link')}
                                    className={`py-1 rounded-md transition-all cursor-pointer ${pdfModeTab === 'link' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                  >
                                    Paste PDF Link
                                  </button>
                                </div>

                                {pdfModeTab === 'upload' ? (
                                  <div 
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setIsDraggingPdf(true);
                                    }}
                                    onDragLeave={() => setIsDraggingPdf(false)}
                                    onDrop={async (e) => {
                                      e.preventDefault();
                                      setIsDraggingPdf(false);
                                      const file = e.dataTransfer.files?.[0];
                                      if (file && file.type === 'application/pdf') {
                                        await handleLocalPdfUpload(selectedSubject.id, file);
                                      } else {
                                        alert("Please drop a valid PDF file.");
                                      }
                                    }}
                                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                                      isDraggingPdf 
                                        ? 'border-[#FF6B00] bg-[#FFF5EE]/60' 
                                        : 'border-slate-200 hover:border-[#FF6B00]/40 hover:bg-[#FFF5EE]/10'
                                    }`}
                                    onClick={() => {
                                      const fileInput = document.getElementById(`pdf-file-picker-${selectedSubject.id}`);
                                      fileInput?.click();
                                    }}
                                  >
                                    <input 
                                      id={`pdf-file-picker-${selectedSubject.id}`}
                                      type="file" 
                                      accept="application/pdf"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          await handleLocalPdfUpload(selectedSubject.id, file);
                                        }
                                      }}
                                    />
                                    <SmartIcon name="cloud_upload" className="mx-auto text-gray-400 mb-1" size={24} />
                                    <p className="text-[11px] font-semibold text-slate-700 font-sans">Drag & drop your reference PDF</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-sans">or <span className="text-[#FF6B00] underline font-bold">browse local files</span></p>
                                    {isPdfLoading && (
                                      <p className="text-[9px] text-[#FF6B00] font-bold animate-pulse mt-2">Uploading & caching file...</p>
                                    )}
                                  </div>
                                ) : (
                                  <form 
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const input = e.currentTarget.elements.namedItem('pdfInput') as HTMLInputElement;
                                      if (input && input.value.trim()) {
                                        handleUpdatePdfUrl(selectedSubject.id, input.value.trim());
                                        input.value = '';
                                      }
                                    }}
                                    className="space-y-2 animate-fadeIn"
                                  >
                                    <p className="text-[10px] text-gray-400 leading-normal font-sans">Paste classroom reference portal or direct HTTP PDF link:</p>
                                    <div className="flex gap-1.5">
                                      <input
                                        name="pdfInput"
                                        type="url"
                                        required
                                        placeholder="https://example.com/handbook.pdf"
                                        className="flex-1 text-xs border border-gray-200 p-2 rounded-lg outline-none focus:border-[#FF6B00] bg-gray-50/50 font-sans"
                                      />
                                      <button
                                        type="submit"
                                        className="bg-[#FF6B00] hover:bg-[#e05e00] text-white px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Right Side: Main customizable folders split block */}
                        <div className="md:col-span-2 space-y-8">
                          {['note', 'video', 'concept'].map((typeKey) => {
                            const subset = items.filter(it => it.subjectId === selectedSubject.id && it.type === typeKey && !it.archived);
                            return (
                              <div key={typeKey} className="space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1 font-sans">
                                    <span>{typeKey === 'note' ? '📝 Class Notes' : typeKey === 'video' ? '🎬 Watchlist Videos' : '💡 Vocabulary & Concepts'}</span>
                                    <span className="text-gray-400 text-[10px] font-medium font-sans">({subset.length})</span>
                                  </h3>
                                  <button
                                    onClick={() => {
                                      setAddModalInitialTab(typeKey as any);
                                      setAddModalPreselectedSubjectId(selectedSubject.id);
                                      setIsAddModalOpen(true);
                                    }}
                                    className="text-[#FF6B00] hover:text-[#e05e00] font-sans font-extrabold text-[11px] flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <SmartIcon name="add" size={11} />
                                    <span>Add</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {subset.map((it) => (
                                    <div
                                      key={it.id}
                                      onClick={() => handleOpenItem(it)}
                                      className="bg-white p-3.5 rounded-xl border border-gray-100 hover:border-[#FF6B00]/40 transition-all duration-150 cursor-pointer flex justify-between items-center group shadow-xs hover:shadow-sm"
                                    >
                                      <div className="overflow-hidden pr-2 flex-1">
                                        <h4 className="font-sans font-bold text-xs text-gray-900 group-hover:text-[#FF6B00] truncate" title={it.title}>
                                          {it.title}
                                        </h4>
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5 font-bold uppercase tracking-wider">
                                          {it.tags.length > 0 ? it.tags.slice(0, 2).join(' • ') : 'Resource'}
                                        </p>
                                      </div>
                                      <div className="shrink-0 flex items-center gap-1 z-30">
                                        {it.bookmarked && (
                                          <SmartIcon name="bookmark" size={12} className="text-[#FF6B00] fill-current" />
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteItem(it.id);
                                          }}
                                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer animate-none"
                                          title="Delete this resource"
                                        >
                                          <SmartIcon name="delete" size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {subset.length === 0 && (
                                    <div className="col-span-full py-4 text-center text-gray-400/70 text-xs italic bg-gray-50/50 rounded-xl border border-dashed border-gray-100 font-sans">
                                      No {typeKey}s in this category yet. Click "Add" above to customize!
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. VIDEO VAULT LISTING VIEW */}
                {activeTab === 'videos' && (
                  <motion.div
                    key="videos"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
                      <div>
                        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1A1A1A]">Classrooms Video Vault</h1>
                        <p className="text-gray-500 text-xs font-sans">A unified place for YouTube crash courses, topic lectures, and bookmarks to skip logins.</p>
                      </div>
                      <button
                        onClick={() => {
                          setAddModalInitialTab('video');
                          setAddModalPreselectedSubjectId(null);
                          setIsAddModalOpen(true);
                        }}
                        className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <SmartIcon name="add" size={12} className="text-white" />
                        <span>Add Video Link</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {items.filter(it => it.type === 'video' && !it.archived).map((vItem) => {
                        const parent = subjects.find(s => s.id === vItem.subjectId);
                        return (
                          <div 
                            key={vItem.id}
                            className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden hover:border-[#FF6B00]/30 hover:shadow-xs transition-all flex flex-col justify-between"
                          >
                            <div className="p-4 space-y-3 cursor-pointer" onClick={() => handleOpenItem(vItem)}>
                              <div className="flex justify-between items-start">
                                <span className={`p-1.5 rounded-lg text-white ${parent?.coverColor || 'bg-[#FF6B00]'}`}>
                                  <SmartIcon name="video" size={14} />
                                </span>
                                <div className="flex items-center gap-1.5 z-30">
                                  <span className="bg-[#FFF5EE] px-2.5 py-0.5 rounded text-[9px] font-bold text-[#FF6B00] uppercase tracking-wider">
                                    {parent?.title || 'System'}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteItem(vItem.id);
                                    }}
                                    className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                                    title="Delete video link"
                                  >
                                    <SmartIcon name="delete" size={12} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-sans font-bold text-sm text-[#1A1A1A] hover:text-[#FF6B00] line-clamp-2 leading-snug">{vItem.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{vItem.content || 'Browse streams and play alongside notepad blocks quickly.'}</p>
                              </div>
                            </div>
                            
                            {/* Video watch tag */}
                            <div 
                              onClick={() => handleOpenItem(vItem)}
                              className="p-3.5 bg-slate-50 border-t flex justify-between items-center text-[11px] text-slate-500 cursor-pointer hover:bg-slate-100/60 duration-100"
                            >
                              <span className="font-semibold italic font-serif">Click to launch player</span>
                              <SmartIcon name="chevronright" size={13} className="text-slate-400 group-hover:translate-x-1 duration-150" />
                            </div>
                          </div>
                        );
                      })}
                      {items.filter(it => it.type === 'video' && !it.archived).length === 0 && (
                        <div className="col-span-full border-2 border-dashed rounded-2xl p-12 text-center text-slate-400 bg-white shadow-xs">
                          <SmartIcon name="video" size={32} className="mx-auto text-slate-200 mb-2" />
                          <p className="font-sans text-sm">No lecture videos referenced.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 5. CONCEPT BANK LISTING VIEW */}
                {activeTab === 'concepts' && (
                  <motion.div
                    key="concepts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
                      <div>
                        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1A1A1A]">Concept Flashcard Bank</h1>
                        <p className="text-gray-500 text-xs font-sans">Micro learning explanations, vocabulary definitions, and interview coding structures.</p>
                      </div>
                      <button
                        onClick={() => {
                          setAddModalInitialTab('concept');
                          setAddModalPreselectedSubjectId(null);
                          setIsAddModalOpen(true);
                        }}
                        className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <SmartIcon name="add" size={12} className="text-white" />
                        <span>Add Concept Card</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {items.filter(it => it.type === 'concept' && !it.archived).map((cItem) => {
                        const parent = subjects.find(s => s.id === cItem.subjectId);
                        return (
                          <div 
                            key={cItem.id}
                            className="bg-white rounded-xl border border-[#E5E5E5] p-4 hover:border-[#FF6B00]/30 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2 cursor-pointer" onClick={() => handleOpenItem(cItem)}>
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]`}>
                                  {parent?.title || 'Core'}
                                </span>
                                <div className="flex items-center gap-1 z-30">
                                  {cItem.bookmarked && (
                                    <SmartIcon name="bookmark" size={12} className="text-[#FF6B00] fill-current" />
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteItem(cItem.id);
                                    }}
                                    className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                                    title="Delete concept card"
                                  >
                                    <SmartIcon name="delete" size={12} />
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-sans font-extrabold text-base text-[#1A1A1A] group-hover:text-[#FF6B00] leading-snug">{cItem.title}</h3>
                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{cItem.content}</p>
                            </div>

                            <p onClick={() => handleOpenItem(cItem)} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2 border-t">Click to reveal details</p>
                          </div>
                        );
                      })}
                      {items.filter(it => it.type === 'concept' && !it.archived).length === 0 && (
                        <div className="col-span-full border-2 border-dashed rounded-2xl p-12 text-center text-slate-400 bg-white shadow-xs">
                          <SmartIcon name="lightbulb" size={32} className="mx-auto text-slate-200 mb-2" />
                          <p className="font-sans text-sm">No conceptual micro-cards registered.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 6. CLOSET/ARCHIVE VIEW */}
                {activeTab === 'archive' && (
                  <motion.div
                    key="archive"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="font-sans text-3xl font-bold tracking-tight text-[#1A1A1A]">Vault Archive Closets</h1>
                      <p className="text-gray-500 text-xs">Keep your primary bookshelves clean! Move finished research logs or completed assignments to the closet cabinets.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5]">
                      <div className="flex flex-col gap-3">
                        {items.filter(it => it.archived).map((it) => {
                          const parent = subjects.find(s => s.id === it.subjectId);
                          return (
                            <div 
                              key={it.id}
                              className="bg-slate-50 p-4 rounded-xl flex justify-between items-center text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <span className="p-2 bg-slate-200 text-slate-500 rounded-lg">
                                  <SmartIcon name={it.type === 'note' ? 'stickynote' : 'video'} size={14} />
                                </span>
                                <div>
                                  <h4 className="font-bold text-slate-700">{it.title}</h4>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mt-0.5">{parent?.title || 'General'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    await handleUpdateItem({ ...it, archived: false });
                                    alert("Item restored back on bookshelf!");
                                  }}
                                  className="bg-white hover:bg-emerald-500 hover:text-white border px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600"
                                >
                                  Take out Archive
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(it.id)}
                                  className="p-1 px-2.5 text-slate-400 hover:text-red-500 transition-all font-bold"
                                  title="Wipe permanently"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {items.filter(it => it.archived).length === 0 && (
                          <div className="py-12 text-center text-slate-400 select-none">
                            <SmartIcon name="archive" size={32} className="mx-auto mb-2 text-slate-200" />
                            <p className="font-sans text-sm">Cabinet is empty. No archived notes.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 7. SETTINGS PAGE VIEW */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="font-sans text-3xl font-bold tracking-tight text-[#1A1A1A]">Cabinet & Database Settings</h1>
                      <p className="text-gray-500 text-xs font-sans">Adjust profile goals, restore default assets, and customize indexing parameters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Personalizer */}
                      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                        <h3 className="font-sans font-black text-sm text-[#1A1A1A] uppercase tracking-wider">Profile Customizer</h3>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">Student Name</label>
                          <input 
                            type="text" 
                            className="border p-3 rounded-xl text-sm outline-none focus:border-[#FF6B00] font-sans" 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)} 
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">Professional Title / Motto</label>
                          <input 
                            type="text" 
                            className="border p-3 rounded-xl text-sm outline-none focus:border-[#FF6B00] font-sans" 
                            value={userTitle} 
                            onChange={(e) => setUserTitle(e.target.value)} 
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">Avatar Photo Image URL</label>
                          <input 
                            type="url" 
                            className="border p-3 rounded-xl text-sm outline-none focus:border-[#FF6B00] font-sans" 
                            value={userAvatar} 
                            onChange={(e) => setUserAvatar(e.target.value)} 
                          />
                        </div>
                      </div>

                      {/* Databases Management */}
                      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <h3 className="font-sans font-black text-sm text-[#1A1A1A] uppercase tracking-wider">IndexedDB Utilities</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-sans">
                            Your learning materials are preserved fully offline on this browser's secure client Sandbox storage. Clears logs only if you wipe browser cache elements. Use backup scripts regularly.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={resetAppToSeed}
                            className="bg-[#FFF5EE] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            Reset Seed Materials
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 8. SUPPORT PAGE VIEW */}
                {activeTab === 'support' && (
                  <motion.div
                    key="support"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="font-sans text-3xl font-bold text-[#1A1A1A]">Classroom Sync Support Guide</h1>
                      <p className="text-gray-500 text-xs">Troubleshooting offline binders, linking web references, and auto-remember guides.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-6 text-sm">
                      <div className="space-y-2.5 border-b pb-4">
                        <h3 className="font-sans font-bold text-base text-[#1A1A1A] flex items-center gap-1.5">
                          <span>💡 What is the "Remember Portal PDF" capability?</span>
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          Whenever you link a PDF URL into any subject profile book, the system caches the key locations inside **IndexedDB**. Next time you open that Subject Workspace, you can read and parse study elements instantly without re-navigating portals or rechecking school authentication tokens!
                        </p>
                      </div>

                      <div className="space-y-2.5 border-b pb-4">
                        <h3 className="font-serif font-bold text-base text-[#0F172A]">🎬 Simultaneous YouTube Take-Noting</h3>
                        <p className="text-slate-600 leading-relaxed">
                          Inside the **Video Vault**, clicking on any video mounts the classroom dynamic player alongside responsive editor sidepads. You can take precise lectures, evaluate coding protocols, write prototype notes, and click "Save" live while continuing to hear and observe visual streams!
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <h3 className="font-serif font-bold text-base text-[#0F172A]">⚙️ Backing up data</h3>
                        <p className="text-slate-600 leading-relaxed">
                          Since standard browsers sandbox IndexedDB stores under specific domains, clearing browser caches or resetting local directories directly wipes data. To prevent this, click **"Reset Seed Materials"** inside the custom settings portal if you ever want to re-seed demo files safely!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* MODAL POPUPS & DRAWING UTILITIES */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalPreselectedSubjectId(null);
        }}
        subjects={subjects}
        onAddSubject={handleAddSubject}
        onAddItem={handleAddLibraryItem}
        preselectedSubjectId={addModalPreselectedSubjectId}
        initialTab={addModalInitialTab}
      />

      <ItemDrawer
        item={selectedItem}
        subject={subjects.find(s => s.id === selectedItem?.subjectId) || null}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedItem(null); }}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onUpdatePdfUrl={handleUpdatePdfUrl}
      />

      {/* Dynamic Confirmation Dialog Overlay */}
      <AnimatePresence>
        {confirmState && confirmState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant glass opacity */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmState(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Confirm Content Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-2 bg-red-50 rounded-xl">
                  <SmartIcon name="delete" size={20} className="text-red-500" />
                </div>
                <h3 className="font-sans font-extrabold text-base text-slate-900">
                  {confirmState.title || "Confirm Action"}
                </h3>
              </div>
              
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {confirmState.message}
              </p>
              
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                >
                  No, Keep it
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await confirmState.onConfirm();
                    } catch (err) {
                      console.error("Error confirmation action: ", err);
                    } finally {
                      setConfirmState(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-sm shadow-red-100"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Sync Navigation (specifically optimized for viewports matching layouter specs) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] py-2 flex justify-around items-center px-4 rounded-t-xl shadow-lg">
        <button 
          onClick={() => { setSelectedSubjectId(null); setActiveTab('home'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
            activeTab === 'home' ? 'text-[#FF6B00] bg-[#FFF5EE] px-3' : 'text-gray-400'
          }`}
        >
          <SmartIcon name="home" size={18} />
          <span className="text-[10px] font-bold font-sans mt-0.5">Home</span>
        </button>

        <button 
          onClick={() => { setSelectedSubjectId(null); setActiveTab('subjects'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
            activeTab === 'subjects' || activeTab === 'subject-detail' ? 'text-[#FF6B00] bg-[#FFF5EE] px-3' : 'text-gray-400'
          }`}
        >
          <SmartIcon name="subject" size={18} />
          <span className="text-[10px] font-bold font-sans mt-0.5">Subjects</span>
        </button>

        <button 
          onClick={() => { setSelectedSubjectId(null); setActiveTab('videos'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
            activeTab === 'videos' ? 'text-[#FF6B00] bg-[#FFF5EE] px-3' : 'text-gray-400'
          }`}
        >
          <SmartIcon name="video_library" size={18} />
          <span className="text-[10px] font-bold font-sans mt-0.5">Videos</span>
        </button>

        <button 
          onClick={() => { setSelectedSubjectId(null); setActiveTab('concepts'); }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
            activeTab === 'concepts' ? 'text-[#FF6B00] bg-[#FFF5EE] px-3' : 'text-gray-400'
          }`}
        >
          <SmartIcon name="lightbulb" size={18} />
          <span className="text-[10px] font-bold font-sans mt-0.5">Concepts</span>
        </button>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9E4D] text-white shadow-md active:scale-90 duration-150"
        >
          <SmartIcon name="add" size={18} />
        </button>
      </footer>

    </div>
  );
}
