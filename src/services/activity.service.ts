import prisma from '../config/prisma';
import { StreakService } from './streak.service';

export class ActivityService {
  static async startActivity(userId: string, data: {
    roadmapItemId?: string;
    activityType: string;
  }) {
    const activity = await prisma.learningActivity.create({
      data: {
        userId,
        roadmapItemId: data.roadmapItemId,
        activityType: data.activityType,
        startedAt: new Date(),
      },
    });

    if (data.roadmapItemId) {
      await prisma.roadmapItem.update({
        where: { id: data.roadmapItemId },
        data: { status: 'in_progress' },
      });
    }

    return activity;
  }

  static async completeActivity(activityId: string, data: {
    durationMinutes?: number;
    score?: number;
  }) {
    const completedAt = new Date();

    const activity = await prisma.learningActivity.update({
      where: { id: activityId },
      data: {
        completedAt,
        durationMinutes: data.durationMinutes || 30,
        score: data.score,
      },
    });

    // Update associated roadmap item if applicable
    if (activity.roadmapItemId) {
      await prisma.roadmapItem.update({
        where: { id: activity.roadmapItemId },
        data: {
          status: 'completed',
          completedAt,
        },
      });
    }

    // Trigger streak record update
    await StreakService.recordActivityStreak(activity.userId);

    return activity;
  }

  static async getActivityHistory(userId: string) {
    return prisma.learningActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        roadmapItem: {
          include: {
            course: true,
            competency: true,
          },
        },
      },
    });
  }
}
