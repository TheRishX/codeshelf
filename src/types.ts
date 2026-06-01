/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  title: string;          // e.g., "ES6 & Beyond"
  coverColor: string;     // e.g., "bg-secondary"
  progress: number;       // 0 to 100
  icon: string;           // Lucide icon name
  category: string;       // e.g., "Frontend Mastery", "Backend", "Fundamentals"
  tags: string[];
  favorite: boolean;
  studyHours: number;
  pdfUrl?: string;        // Auto-remembered URL/path to reference PDF
  lastOpenedAt?: number;  // Timestamp
}

export interface LibraryItem {
  id: string;
  subjectId: string;
  type: 'note' | 'video' | 'concept';
  title: string;
  url?: string;           // Web link, YouTube embed, or resource path
  content: string;        // Markdown/Rich text for personal study notes
  tags: string[];
  bookmarked: boolean;
  archived: boolean;
  createdAt: number;
  lastOpenedAt: number;
  videoDuration?: number; // Total seconds
  videoProgress?: number;  // Current seconds watched
}

export interface LearningSession {
  id: string;
  subjectId: string;
  subjectTitle: string;
  durationMinutes: number;
  timestamp: number;
}
