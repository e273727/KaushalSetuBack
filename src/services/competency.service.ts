import prisma from '../config/prisma';

export class CompetencyService {
  static async getAllCompetencies() {
    return prisma.competency.findMany({
      orderBy: { domain: 'asc' },
    });
  }

  static async getUserCompetencies(userId: string) {
    return prisma.userCompetency.findMany({
      where: { userId },
      include: {
        competency: true,
      },
      orderBy: { currentLevel: 'desc' },
    });
  }

  static async getJobRoles() {
    return prisma.jobRole.findMany({
      include: {
        jobRoleCompetencies: {
          include: {
            competency: true,
          },
        },
      },
    });
  }

  static async createCompetency(data: { name: string; domain: string; description?: string }) {
    return prisma.competency.create({ data });
  }

  static async updateUserCompetencyLevel(userId: string, competencyId: string, level: number, score: number) {
    return prisma.userCompetency.upsert({
      where: {
        userId_competencyId: {
          userId,
          competencyId,
        },
      },
      update: {
        currentLevel: level,
        score,
        lastAssessedAt: new Date(),
      },
      create: {
        userId,
        competencyId,
        currentLevel: level,
        score,
        lastAssessedAt: new Date(),
      },
    });
  }
}
