export type Role = "guest" | "user" | "admin";

export type Action =
  | "view_deadline"
  | "mark_completed"
  | "add_deadline"
  | "delete_deadline";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  code: string;
  teacher: string;
  description: string;
  credits: number;
}

export type DeadlinePriority = "high" | "medium" | "low";

export interface Deadline {
  id: string;
  title: string;
  subjectSlug: string;
  subjectName: string;
  description: string;
  dueDate: string;
  priority: DeadlinePriority;
  completedBy: string[];
  createdAt: string;
  author: string;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  avatar?: string;
}

export interface DeadlineFormData {
  title: string;
  subjectSlug: string;
  description: string;
  dueDate: string;
  priority: DeadlinePriority;
}
