import fs from 'fs';
import path from 'path';
import os from 'os';
import { Subject, Deadline, User, DeadlineFormData } from '@/types';
import defaultDb from '@/data/db.json';

interface DatabaseSchema {
  subjects: Subject[];
  deadlines: Deadline[];
  users: (User & { password?: string })[];
}

/**
 * Xác định đường dẫn lưu trữ phù hợp:
 * - Khi deploy lên Vercel Serverless (process.env.VERCEL): thư mục gốc là read-only, chỉ /tmp được ghi
 * - Khi chạy Local: ghi trực tiếp vào src/data/db.json
 */
function getStorageFilePath(): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'class-deadline-hub-db.json');
  }
  return path.join(process.cwd(), 'src', 'data', 'db.json');
}

// In-memory cache nhằm đảm bảo phản hồi tức thì và an toàn trên môi trường Serverless
let memoryCache: DatabaseSchema | null = null;

/**
 * Đọc dữ liệu từ file JSON phía server (có hỗ trợ môi trường Vercel /tmp)
 */
export function readDatabase(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  const filePath = getStorageFilePath();

  try {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      memoryCache = JSON.parse(rawData) as DatabaseSchema;
      return memoryCache;
    }
  } catch (error) {
    console.warn(`Could not read database from ${filePath}, falling back to default seed:`, error);
  }

  // Khởi tạo từ file defaultDb mẫu (src/data/db.json)
  memoryCache = JSON.parse(JSON.stringify(defaultDb)) as DatabaseSchema;

  // Nếu là môi trường Vercel, thử khởi tạo file trong /tmp
  if (process.env.VERCEL) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(memoryCache, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to initialize /tmp db file on Vercel:', e);
    }
  }

  return memoryCache;
}

/**
 * Ghi dữ liệu vào file JSON phía server
 */
export function writeDatabase(data: DatabaseSchema): void {
  memoryCache = data;
  const filePath = getStorageFilePath();

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing database to ${filePath}:`, error);
    // Trong môi trường serverless nếu ghi file bị chặn, bộ nhớ memoryCache vẫn giữ trạng thái
  }
}

// =================== SUBJECTS ===================

export function getAllSubjects(): Subject[] {
  const db = readDatabase();
  return db.subjects;
}

export function getSubjectBySlug(slug: string): Subject | undefined {
  const db = readDatabase();
  return db.subjects.find((s) => s.slug === slug);
}

// =================== DEADLINES ===================

export function getAllDeadlines(): Deadline[] {
  const db = readDatabase();
  // Sắp xếp theo hạn chót tăng dần (deadline sắp đến lên đầu)
  return [...db.deadlines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function getDeadlinesBySubject(subjectSlug: string): Deadline[] {
  const db = readDatabase();
  return db.deadlines
    .filter((d) => d.subjectSlug === subjectSlug)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function getDeadlineById(id: string): Deadline | undefined {
  const db = readDatabase();
  return db.deadlines.find((d) => d.id === String(id));
}

export function addDeadlineRecord(
  data: DeadlineFormData,
  authorEmail: string = 'admin@ptit.edu.vn'
): Deadline {
  const db = readDatabase();
  const subject = db.subjects.find((s) => s.slug === data.subjectSlug);
  
  // Tạo ID mới tự tăng
  const existingIds = db.deadlines.map((d) => parseInt(d.id, 10)).filter((n) => !isNaN(n));
  const nextId = existingIds.length > 0 ? (Math.max(...existingIds) + 1).toString() : '1';

  const newDeadline: Deadline = {
    id: nextId,
    title: data.title.trim(),
    subjectSlug: data.subjectSlug,
    subjectName: subject ? subject.name : data.subjectSlug,
    description: data.description.trim(),
    dueDate: data.dueDate,
    priority: data.priority,
    completedBy: [],
    createdAt: new Date().toISOString(),
    author: authorEmail,
    tags: [subject?.code || 'Deadline']
  };

  db.deadlines.push(newDeadline);
  writeDatabase(db);
  return newDeadline;
}

export function deleteDeadlineRecord(id: string): boolean {
  const db = readDatabase();
  const initialLength = db.deadlines.length;
  db.deadlines = db.deadlines.filter((d) => d.id !== String(id));
  
  if (db.deadlines.length !== initialLength) {
    writeDatabase(db);
    return true;
  }
  return false;
}

export function toggleDeadlineCompletion(id: string, userEmail: string): Deadline | null {
  const db = readDatabase();
  const deadline = db.deadlines.find((d) => d.id === String(id));
  if (!deadline) {
    return null;
  }

  if (!deadline.completedBy) {
    deadline.completedBy = [];
  }

  const index = deadline.completedBy.indexOf(userEmail);
  if (index > -1) {
    deadline.completedBy.splice(index, 1);
  } else {
    deadline.completedBy.push(userEmail);
  }

  writeDatabase(db);
  return deadline;
}

// =================== USERS ===================

export function getUserByEmail(email: string): (User & { password?: string }) | undefined {
  const db = readDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
