import prisma from '../config/prisma';
import { RecommendationService } from './recommendation.service';
import { GapEngineService } from './gapEngine.service';

export class RoadmapService {
  static async getActiveRoadmap(userId: string) {
    let roadmap = await prisma.roadmap.findFirst({
      where: { userId, status: 'active' },
      include: {
        items: {
          include: {
            course: true,
            competency: true,
          },
          orderBy: [{ scheduledDate: 'asc' }, { priority: 'asc' }],
        },
      },
    });

    if (!roadmap) {
      // Automatically generate initial roadmap if none exists
      roadmap = await this.generateRoadmap(userId);
    }

    return roadmap;
  }

  static async generateRoadmap(userId: string) {
    // Deactivate previous active roadmaps
    await prisma.roadmap.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'archived' },
    });

    // Get current version number
    const lastRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastRoadmap?.version || 0) + 1;

    // Fetch recommendations and skill gaps
    const recData = await RecommendationService.getRecommendedCourses(userId);
    const gapData = await GapEngineService.calculateSkillGaps(userId);

    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        version: newVersion,
        status: 'active',
      },
    });

    // Create 7-day scheduled roadmap items
    const today = new Date();
    const itemsToCreate = [];

    const recommendations = recData.recommendations || [];
    const activeGaps = gapData.gaps.filter((g) => g.gap > 0);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + dayOffset);

      const courseMatch = recommendations[dayOffset % recommendations.length];
      const gapMatch = activeGaps[dayOffset % activeGaps.length];

      itemsToCreate.push({
        roadmapId: newRoadmap.id,
        courseId: courseMatch ? courseMatch.id : null,
        competencyId: gapMatch ? gapMatch.competencyId : null,
        scheduledDate,
        priority: dayOffset + 1,
        status: 'pending',
      });
    }

    await prisma.roadmapItem.createMany({
      data: itemsToCreate,
    });

    return prisma.roadmap.findUnique({
      where: { id: newRoadmap.id },
      include: {
        items: {
          include: {
            course: true,
            competency: true,
          },
          orderBy: [{ scheduledDate: 'asc' }, { priority: 'asc' }],
        },
      },
    });
  }

  /**
   * Recalculates and adapts roadmap version when officer misses days or completes reassessments
   */
  static async recalculateRoadmap(userId: string, reason = 'Roadmap adaptation trigger') {
    console.log(`Adapting roadmap for user ${userId}. Reason: ${reason}`);
    return this.generateRoadmap(userId);
  }
}
