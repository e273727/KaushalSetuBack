import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { supabase } from '../config/supabase';

// In-Memory Database Fallback for when local PostgreSQL database is offline or un-seeded
interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  profile: {
    fullName: string;
    department?: string;
    currentJobRole?: string;
  };
  streak?: {
    currentStreak: number;
    longestStreak: number;
  };
}

const inMemoryUsers = new Map<string, InMemoryUser>();

// Initialize default seed accounts in-memory
(async () => {
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  
  inMemoryUsers.set('officer@kaushalsetu.gov.in', {
    id: 'u-officer-101',
    email: 'officer@kaushalsetu.gov.in',
    passwordHash: defaultPasswordHash,
    role: 'learner',
    profile: {
      fullName: 'Rohit Sharma',
      department: 'National Sample Survey Office (NSSO)',
      currentJobRole: 'Statistical Officer',
    },
    streak: { currentStreak: 3, longestStreak: 9 },
  });

  inMemoryUsers.set('admin@kaushalsetu.gov.in', {
    id: 'u-admin-101',
    email: 'admin@kaushalsetu.gov.in',
    passwordHash: defaultPasswordHash,
    role: 'admin',
    profile: {
      fullName: 'System Administrator',
      department: 'Ministry of Statistics & Programme Implementation',
      currentJobRole: 'Administrator',
    },
    streak: { currentStreak: 5, longestStreak: 14 },
  });
})();

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    fullName: string;
    department?: string;
    currentJobRole?: string;
  }) {
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Try Supabase Auth Sign Up if configured
    let supabaseUserId: string | null = null;
    try {
      if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('xyzcompany')) {
        const { data: suData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              fullName: data.fullName,
              department: data.department,
              currentJobRole: data.currentJobRole,
            },
          },
        });
        if (suData?.user) {
          supabaseUserId = suData.user.id;
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth Warning] Register fallback:', e);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // 2. Try Local Prisma Database
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        throw { statusCode: 400, message: 'Email already registered' };
      }

      const user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'learner',
          profile: {
            create: {
              fullName: data.fullName,
              department: data.department,
              currentJobRole: data.currentJobRole,
            },
          },
          streak: {
            create: {
              currentStreak: 0,
              longestStreak: 0,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { passwordHash: _, ...userWithoutPassword } = user;

      // Also mirror to in-memory fallback store
      inMemoryUsers.set(cleanEmail, {
        id: user.id,
        email: cleanEmail,
        passwordHash,
        role: 'learner',
        profile: {
          fullName: data.fullName,
          department: data.department,
          currentJobRole: data.currentJobRole,
        },
        streak: { currentStreak: 0, longestStreak: 0 },
      });

      return { user: userWithoutPassword, token, supabaseUserId };
    } catch (error: any) {
      if (error.statusCode === 400) {
        throw error;
      }
      
      // If Prisma throws DB connection error, fallback to in-memory store
      if (inMemoryUsers.has(cleanEmail)) {
        throw { statusCode: 400, message: 'Email already registered' };
      }

      const newId = `u-${Date.now()}`;
      const memoryUser: InMemoryUser = {
        id: newId,
        email: cleanEmail,
        passwordHash,
        role: 'learner',
        profile: {
          fullName: data.fullName,
          department: data.department || 'NSSO',
          currentJobRole: data.currentJobRole || 'Statistical Officer',
        },
        streak: { currentStreak: 0, longestStreak: 0 },
      };

      inMemoryUsers.set(cleanEmail, memoryUser);

      const token = generateToken({
        userId: newId,
        email: cleanEmail,
        role: 'learner',
      });

      const { passwordHash: _, ...userWithoutPassword } = memoryUser;
      return { user: userWithoutPassword, token, supabaseUserId };
    }
  }

  static async login(data: { email: string; password: string }) {
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Try Supabase Auth Sign In if configured
    let supabaseSession = null;
    try {
      if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('xyzcompany')) {
        const { data: suAuth } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: data.password,
        });
        if (suAuth && suAuth.session) {
          supabaseSession = suAuth.session;
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth Warning] Login fallback:', e);
    }

    // 2. Try Prisma Database
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          profile: true,
          streak: true,
        },
      });

      if (user) {
        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
          throw { statusCode: 401, message: 'Invalid username or password' };
        }

        const token = generateToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        const { passwordHash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token, supabaseSession };
      }
    } catch (dbError: any) {
      if (dbError.statusCode === 401) {
        throw dbError;
      }
      // If DB error, proceed to fallback in-memory check
    }

    // 3. Fallback to In-Memory store
    const memUser = inMemoryUsers.get(cleanEmail);
    if (!memUser) {
      // User has NOT registered beforehand!
      throw { statusCode: 404, message: 'Sign up first' };
    }

    const isMatch = await bcrypt.compare(data.password, memUser.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid username or password' };
    }

    const token = generateToken({
      userId: memUser.id,
      email: memUser.email,
      role: memUser.role,
    });

    const { passwordHash: _, ...userWithoutPassword } = memUser;
    return { user: userWithoutPassword, token, supabaseSession };
  }

  static async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          certificates: true,
          streak: true,
          userCompetencies: {
            include: {
              competency: true,
            },
          },
        },
      });

      if (user) {
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    } catch (dbErr) {
      // Proceed to in-memory check
    }

    // Check in-memory fallback
    for (const memUser of inMemoryUsers.values()) {
      if (memUser.id === userId) {
        const { passwordHash: _, ...userWithoutPassword } = memUser;
        return userWithoutPassword;
      }
    }

    throw { statusCode: 404, message: 'User not found' };
  }
}
