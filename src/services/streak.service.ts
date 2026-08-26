import prisma from '../config/prisma';

export class StreakService {
  static async getStreak(userId: string) {
    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return streak;
  }

  static async recordActivityStreak(userId: string) {
    const streak = await this.getStreak(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    // Difference in days
    let newCurrentStreak = streak.currentStreak;

    if (!lastDate) {
      // First activity ever
      newCurrentStreak = 1;
    } else {
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day activity! increment streak
        newCurrentStreak += 1;
      } else if (diffDays === 0) {
        // Already logged activity today, maintain streak
        newCurrentStreak = streak.currentStreak;
      } else {
        // Missed day(s)! Reset streak to 1
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

    const updatedStreak = await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
      },
    });

    return updatedStreak;
  }
}
