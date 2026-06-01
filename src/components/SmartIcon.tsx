/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Terminal,
  Layers,
  Database,
  Brush,
  GitFork,
  BookOpen,
  Video,
  Lightbulb,
  Check,
  Plus,
  Search,
  Bell,
  History,
  Grid,
  List,
  Bookmark,
  Archive,
  Folder,
  User,
  Clock,
  StickyNote,
  Settings,
  HelpCircle,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';

interface SmartIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function SmartIcon({ name, className = '', size = 20 }: SmartIconProps) {
  switch (name.toLowerCase()) {
    case 'terminal':
      return <Terminal className={className} size={size} />;
    case 'layers':
    case 'atom':
      return <Layers className={className} size={size} />;
    case 'database':
      return <Database className={className} size={size} />;
    case 'brush':
      return <Brush className={className} size={size} />;
    case 'gitfork':
    case 'account_tree':
      return <GitFork className={className} size={size} />;
    case 'bookopen':
    case 'menu_book':
    case 'auto_stories':
      return <BookOpen className={className} size={size} />;
    case 'video':
    case 'video_library':
    case 'play_circle':
      return <Video className={className} size={size} />;
    case 'lightbulb':
    case 'psychology':
      return <Lightbulb className={className} size={size} />;
    case 'check':
      return <Check className={className} size={size} />;
    case 'plus':
    case 'add':
      return <Plus className={className} size={size} />;
    case 'search':
      return <Search className={className} size={size} />;
    case 'bell':
    case 'notifications':
      return <Bell className={className} size={size} />;
    case 'history':
      return <History className={className} size={size} />;
    case 'grid':
    case 'grid_view':
      return <Grid className={className} size={size} />;
    case 'list':
      return <List className={className} size={size} />;
    case 'bookmark':
      return <Bookmark className={className} size={size} />;
    case 'archive':
    case 'inventory_2':
      return <Archive className={className} size={size} />;
    case 'folder':
    case 'subject':
      return <Folder className={className} size={size} />;
    case 'user':
      return <User className={className} size={size} />;
    case 'clock':
    case 'schedule':
      return <Clock className={className} size={size} />;
    case 'stickynote':
    case 'sticky_note_2':
      return <StickyNote className={className} size={size} />;
    case 'settings':
      return <Settings className={className} size={size} />;
    case 'help':
    case 'support':
      return <HelpCircle className={className} size={size} />;
    case 'eye':
      return <Eye className={className} size={size} />;
    case 'edit':
      return <Edit className={className} size={size} />;
    case 'trash':
    case 'delete':
      return <Trash2 className={className} size={size} />;
    case 'externallink':
    case 'external':
      return <ExternalLink className={className} size={size} />;
    case 'filetext':
    case 'pdf':
      return <FileText className={className} size={size} />;
    case 'chevronright':
      return <ChevronRight className={className} size={size} />;
    case 'chevrondown':
      return <ChevronDown className={className} size={size} />;
    case 'info':
    default:
      return <Info className={className} size={size} />;
  }
}
