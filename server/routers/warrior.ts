import { z } from "zod/v4";
import { protectedProcedure, router } from "../_core/trpc";
import { getWarrior, updateWarrior } from "../db";
import { format } from "date-fns";

const RANKS = ["ронин", "асигару", "буси", "даймё", "сёгун"];
const CITY_LEVELS = ["деревня", "городок", "город", "крепость", "столица"];

function getRank(totalMinutes: number): string {
  if (totalMinutes >= 1440) return RANKS[4]; // 24h
  if (totalMinutes >= 600) return RANKS[3]; // 10h
  if (totalMinutes >= 180) return RANKS[2]; // 3h
  if (totalMinutes >= 60) return RANKS[1]; // 1h
  return RANKS[0];
}

function getCityLevel(totalMinutes: number): number {
  if (totalMinutes >= 600) return 4; // 10h
  if (totalMinutes >= 300) return 3; // 5h
  if (totalMinutes >= 120) return 2; // 2h
  if (totalMinutes >= 30) return 1; // 30min
  return 0;
}

export const warriorRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    return getWarrior(ctx.user.id);
  }),

  addMinutes: protectedProcedure
    .input(z.object({ minutes: z.number().min(1).max(180) }))
    .mutation(async ({ ctx, input }) => {
      const warrior = await getWarrior(ctx.user.id);
      if (!warrior) return null;

      const newTotal = warrior.totalMinutes + input.minutes;
      const newSamuraiCount = Math.floor(newTotal / 3); // 1 samurai per 3 min
      const newRank = getRank(newTotal);
      const newCityLevel = getCityLevel(newTotal);
      const today = format(new Date(), "yyyy-MM-dd");

      let newStreak = warrior.currentStreak;
      if (warrior.lastActiveDate !== today) {
        const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
        if (warrior.lastActiveDate === yesterday) {
          newStreak = warrior.currentStreak + 1;
        } else {
          newStreak = 1;
        }
      }

      const newLongest = Math.max(warrior.longestStreak, newStreak);

      await updateWarrior(ctx.user.id, {
        totalMinutes: newTotal,
        samuraiCount: newSamuraiCount,
        cityLevel: newCityLevel,
        warriorRank: newRank,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      });

      const prevSamurai = warrior.samuraiCount;
      const newSamuraiHired = newSamuraiCount > prevSamurai;

      return {
        totalMinutes: newTotal,
        samuraiCount: newSamuraiCount,
        cityLevel: newCityLevel,
        cityName: CITY_LEVELS[newCityLevel],
        warriorRank: newRank,
        currentStreak: newStreak,
        longestStreak: newLongest,
        newSamuraiHired,
        rankChanged: newRank !== warrior.warriorRank,
      };
    }),
});
