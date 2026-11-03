import { Role } from '@/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    studentId?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      studentId?: string;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    studentId?: string;
  }
}
