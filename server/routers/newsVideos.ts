import { z } from "zod/v4";
import { publicProcedure, router } from "../_core/trpc";
import { getNews, getVideos } from "../db";

export const newsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return getNews(input.limit);
    }),

  videos: publicProcedure
    .input(z.object({ topic: z.string().optional() }))
    .query(async ({ input }) => {
      return getVideos(input.topic);
    }),
});
