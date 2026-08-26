import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    fullName: string;
    department?: string;
    currentJobRole?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
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

    return { user: userWithoutPassword, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
        streak: true,
      },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getUserProfile(userId: string) {
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

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
