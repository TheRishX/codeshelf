/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, LibraryItem, LearningSession } from '../types';

const DB_NAME = 'SheryiansLibraryDB';
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains('subjects')) {
        db.createObjectStore('subjects', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('subjectId', 'subjectId', { unique: false });
        itemStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
    };
  });
}

// Default Seed Data
const defaultSubjects: Subject[] = [
  {
    id: 'sub-js',
    title: 'ES6 & Beyond',
    coverColor: 'bg-[#9b4500]', // Sheryians secondary orange
    progress: 75,
    icon: 'Terminal',
    category: 'Frontend Mastery',
    tags: ['JavaScript', 'Advanced', 'Sheryians'],
    favorite: true,
    studyHours: 42,
    pdfUrl: 'https://notes.sheryians.com/resources/js-es6-handbook.pdf',
    lastOpenedAt: Date.now() - 120000 // 2 mins ago
  },
  {
    id: 'sub-react',
    title: 'Components & Hooks',
    coverColor: 'bg-[#00288e]', // Sheryians primary deep blue
    progress: 30,
    icon: 'Layers',
    category: 'React Ecosystem',
    tags: ['React', 'Web Dev', 'Frontend'],
    favorite: true,
    studyHours: 18,
    pdfUrl: 'https://notes.sheryians.com/resources/react-hooks-reference.pdf',
    lastOpenedAt: Date.now() - 3600000 // 1 hour ago
  },
  {
    id: 'sub-node',
    title: 'Backend Architecture',
    coverColor: 'bg-[#25354a]', // Dark Slate
    progress: 100,
    icon: 'Database',
    category: 'Node & SQL',
    tags: ['Express', 'REST API', 'SQL'],
    favorite: false,
    studyHours: 56,
    pdfUrl: 'https://notes.sheryians.com/resources/node-backend-blueprint.pdf',
    lastOpenedAt: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 'sub-figma',
    title: 'Figma & Tailwind',
    coverColor: 'bg-[#1e40af]', // Vibrant academic blue
    progress: 55,
    icon: 'Brush',
    category: 'UI/UX Craft',
    tags: ['Figma', 'Tailwind', 'Modern Design'],
    favorite: true,
    studyHours: 21,
    pdfUrl: 'https://notes.sheryians.com/resources/tailwind-cheatsheet.pdf',
    lastOpenedAt: Date.now() - 172800000 // 2 days ago
  },
  {
    id: 'sub-dsa',
    title: 'Algorithmic Thinking',
    coverColor: 'bg-[#757684]', // Neutral Slate Gray
    progress: 15,
    icon: 'GitFork',
    category: 'Computer Science',
    tags: ['DSA', 'Recursion', 'Logic'],
    favorite: false,
    studyHours: 5,
    pdfUrl: 'https://notes.sheryians.com/resources/dsa-crash-course.pdf',
    lastOpenedAt: Date.now() - 259200000 // 3 days ago
  }
];

const defaultItems: LibraryItem[] = [
  // JS items
  {
    id: 'item-js-1',
    subjectId: 'sub-js',
    type: 'note',
    title: 'Closures & Prototype Inheritance',
    content: `## What is a Closure?
A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the **lexical environment**). In other words, a closure gives you access to an outer function's scope from an inner function.

### Example in Coding Exams:
\`\`\`javascript
function outer() {
  let counter = 0;
  return function inner() {
    counter++;
    console.log(counter);
  };
}
const add = outer();
add(); // 1
add(); // 2
\`\`\`

## Prototype Inheritance
In JavaScript, objects have a special hidden property \`[[Prototype]]\`, which is either \`null\` or references another object. That object is called "a prototype".
When we read a property from \`object\`, and it's missing, JavaScript automatically takes it from the prototype. This is called "prototypal inheritance".`,
    tags: ['Lexical Scope', 'Interview', 'JS Core2'],
    bookmarked: true,
    archived: false,
    createdAt: Date.now() - 10000000,
    lastOpenedAt: Date.now() - 200000
  },
  {
    id: 'item-js-2',
    subjectId: 'sub-js',
    type: 'video',
    title: 'Sheryians JS Crash Course - Event Loop explained',
    url: 'https://www.youtube.com/embed/8zKuNo4R1Y4',
    content: 'Brilliant conceptual classroom style review of Microtask Queue, Call Stack, Callback Queue, and Web APIs. Remember that Promises callback go to Microtask Queue which has high priority over Callback queue tasks.',
    tags: ['Event Loop', 'Async', 'Sheryians Channel'],
    bookmarked: false,
    archived: false,
    createdAt: Date.now() - 9000000,
    lastOpenedAt: Date.now() - 150000
  },
  {
    id: 'item-js-3',
    subjectId: 'sub-js',
    type: 'concept',
    title: 'Temporal Dead Zone (TDZ)',
    content: 'The Temporal Dead Zone (TDZ) is the area of any block scope where a variable declared with `let` or `const` is inaccessible until the computer fully evaluates its definition. Using variable before declaration throws a ReferenceError.',
    tags: ['ES6', 'Memory Allocation'],
    bookmarked: true,
    archived: false,
    createdAt: Date.now() - 8000000,
    lastOpenedAt: Date.now() - 500000
  },

  // React items
  {
    id: 'item-react-1',
    subjectId: 'sub-react',
    type: 'note',
    title: 'Practical use of React.memo vs useMemo',
    content: `## Optimization inside Shery "Sheryians" Ecosystem
1. **React.memo**: Pure Higher Order Component that props-compares before re-rendering child widgets.
2. **useMemo**: Cache computationally heavy values across re-renders.

### Code Checklist:
\`\`\`typescript
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.text}</div>;
});
\`\`\`
Never optimize early without profiling under chrome React DevTools!`,
    tags: ['Hooks', 'Memoization', 'Speed'],
    bookmarked: true,
    archived: false,
    createdAt: Date.now() - 5000000,
    lastOpenedAt: Date.now() - 3600000
  },
  {
    id: 'item-react-2',
    subjectId: 'sub-react',
    type: 'video',
    title: 'React 19 & Next.js App Router hooks demo',
    url: 'https://www.youtube.com/embed/K844C76pWno',
    content: 'Review of `useOptimistic`, server actions, integration hooks, and the upcoming compilation model.',
    tags: ['NextJS', 'Server Actions'],
    bookmarked: false,
    archived: false,
    createdAt: Date.now() - 4000000,
    lastOpenedAt: Date.now() - 3800000
  },

  // Node & SQL items
  {
    id: 'item-node-1',
    subjectId: 'sub-node',
    type: 'note',
    title: 'Building Scalable Express Routing',
    content: `## Modern REST architecture checklist
1. **Express Router setup**
2. **Central Error handling**
3. **Zod Validation integration**

\`\`\`javascript
const express = require('express');
const router = express.Router();

router.get('/users', async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users');
    res.json({ success: true, data });
  } catch(e) {
    next(e);
  }
});
\`\`\`
Ensure all routers are mounted under \`/api/\` prefix!`,
    tags: ['Routing', 'Best Practice'],
    bookmarked: false,
    archived: false,
    createdAt: Date.now() - 20000000,
    lastOpenedAt: Date.now() - 86450000
  }
];

export async function seedDBIfEmpty(db: IDBDatabase): Promise<void> {
  const transaction = db.transaction(['subjects', 'items'], 'readwrite');
  const subjectsStore = transaction.objectStore('subjects');
  const itemsStore = transaction.objectStore('items');

  return new Promise((resolve, reject) => {
    const countRequest = subjectsStore.count();

    countRequest.onsuccess = () => {
      if (countRequest.result === 0) {
        // Seed database
        defaultSubjects.forEach(subject => {
          subjectsStore.put(subject);
        });
        defaultItems.forEach(item => {
          itemsStore.put(item);
        });
        console.log('IndexedDB seeded successfully!');
      }
      resolve();
    };

    countRequest.onerror = () => {
      reject(new Error('Seed count query failed'));
    };
  });
}

// Database Getters/Setters

export async function getAllSubjects(): Promise<Subject[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('subjects', 'readonly');
    const store = transaction.objectStore('subjects');
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort subjects: last opened or alphabetical
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSubject(subject: Subject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('subjects', 'readwrite');
    const store = transaction.objectStore('subjects');
    const request = store.put(subject);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSubject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['subjects', 'items'], 'readwrite');
    // Delete subject
    transaction.objectStore('subjects').delete(id);

    // Also cascade delete items belonging to that subject
    const itemsStore = transaction.objectStore('items');
    const index = itemsStore.index('subjectId');
    const request = index.openCursor(IDBKeyRange.only(id));

    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(): Promise<LibraryItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getItemsBySubject(subjectId: string): Promise<LibraryItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readonly');
    const store = transaction.objectStore('items');
    const index = store.index('subjectId');
    const request = index.getAll(IDBKeyRange.only(subjectId));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveItem(item: LibraryItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Statistics helpers
export async function getStats(): Promise<{ totalBooks: number; hoursStudied: number; notesSaved: number }> {
  const subjects = await getAllSubjects();
  const items = await getAllItems();

  const totalBooks = subjects.length;
  const hoursStudied = subjects.reduce((sum, s) => sum + (s.studyHours || 0), 0);
  const notesSaved = items.filter(it => it.type === 'note' && !it.archived).length;

  return { totalBooks, hoursStudied, notesSaved };
}
