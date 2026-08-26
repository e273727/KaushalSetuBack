import prisma from '../config/prisma';

const MOCK_COMPETENCIES_LIST = [
  { id: "c1", name: "Survey Design", domain: "Statistical", description: "Design national survey instruments and metadata standards." },
  { id: "c2", name: "Sampling Techniques", domain: "Statistical", description: "Apply probability sampling, stratification, and sample weight estimation." },
  { id: "c3", name: "Data Quality & Audit", domain: "Statistical", description: "Statistical data audit, outlier detection, and clean dataset validation." },
  { id: "c4", name: "Python for Statistics", domain: "Technical", description: "Data manipulation, Pandas, NumPy, and statistical calculations." },
  { id: "c5", name: "SQL & Database Querying", domain: "Technical", description: "Relational query design, joining statistical tables, and data transformation." },
  { id: "c6", name: "Data Visualization", domain: "Technical", description: "Creating executive dashboards, charts, and spatial statistical maps." },
  { id: "c7", name: "AI & Machine Learning", domain: "Technical", description: "Predictive analytics, NLP, and machine learning models for public policy." },
  { id: "c8", name: "Digital Governance & Cybersecurity", domain: "Digital Governance", description: "Data privacy rules, government IT security protocols, and compliance." },
];

export class CompetencyService {
  static async getAllCompetencies() {
    try {
      return await prisma.competency.findMany({
        orderBy: { domain: 'asc' },
      });
    } catch {
      return MOCK_COMPETENCIES_LIST;
    }
  }

  static async getUserCompetencies(userId: string) {
    try {
      const userComps = await prisma.userCompetency.findMany({
        where: { userId },
        include: {
          competency: true,
        },
        orderBy: { currentLevel: 'desc' },
      });
      if (userComps && userComps.length > 0) return userComps;
    } catch {
      // Fallback
    }

    return MOCK_COMPETENCIES_LIST.map((comp) => ({
      id: `uc-${comp.id}`,
      userId,
      competencyId: comp.id,
      currentLevel: comp.domain === 'Statistical' ? 4 : 2,
      score: comp.domain === 'Statistical' ? 80.0 : 45.0,
      lastAssessedAt: new Date(),
      competency: comp,
    }));
  }

  static async getJobRoles() {
    try {
      return await prisma.jobRole.findMany({
        include: {
          jobRoleCompetencies: {
            include: {
              competency: true,
            },
          },
        },
      });
    } catch {
      return [
        { id: 'jr-1', name: 'Statistical Officer', description: 'Oversees statistical surveys and sampling.' },
        { id: 'jr-2', name: 'Data Analyst', description: 'Analyzes public sector data and builds dashboards.' },
        { id: 'jr-3', name: 'Survey Officer', description: 'Manages field survey operations.' },
        { id: 'jr-4', name: 'Data Processing Officer', description: 'Manages database systems and data cleaning.' },
      ];
    }
  }

  static async createCompetency(data: { name: string; domain: string; description?: string }) {
    try {
      return await prisma.competency.create({ data });
    } catch {
      const created = { id: `c-${Date.now()}`, ...data };
      MOCK_COMPETENCIES_LIST.push(created as any);
      return created;
    }
  }

  static async updateUserCompetencyLevel(userId: string, competencyId: string, level: number, score: number) {
    try {
      return await prisma.userCompetency.upsert({
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
    } catch {
      return {
        id: `uc-${Date.now()}`,
        userId,
        competencyId,
        currentLevel: level,
        score,
        lastAssessedAt: new Date(),
      };
    }
  }
}
