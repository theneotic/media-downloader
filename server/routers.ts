import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { inspectSourceUrl } from "./media/inspect";
import {
  claimNextMediaJob,
  createYouTubeJob,
  listUserMediaJobs,
  workerUpdateSchema,
  updateMediaJobFromWorker,
  youtubeJobInputSchema,
} from "./media/jobs";
import { assertWorkerSecret } from "./media/workerAuth";
import { z } from "zod";

const mediaSourceSchema = z.enum(["youtube", "spotify", "appleMusic"]);

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  media: router({
    inspect: publicProcedure
      .input(
        z.object({
          source: mediaSourceSchema,
          url: z.string().url(),
        }),
      )
      .mutation(({ input }) => inspectSourceUrl(input.source, input.url)),
    worker: router({
      verify: publicProcedure
        .input(z.object({ workerSecret: z.string().min(1) }))
        .mutation(({ input }) => {
          assertWorkerSecret(input.workerSecret);
          return { authenticated: true } as const;
        }),
      claim: publicProcedure
        .input(z.object({ workerSecret: z.string().min(1), workerReference: z.string().min(3).max(64) }))
        .mutation(async ({ input }) => {
          assertWorkerSecret(input.workerSecret);
          return claimNextMediaJob(input.workerReference);
        }),
      update: publicProcedure
        .input(z.object({ workerSecret: z.string().min(1), update: workerUpdateSchema }))
        .mutation(async ({ input }) => {
          assertWorkerSecret(input.workerSecret);
          return updateMediaJobFromWorker(input.update);
        }),
    }),
    jobs: router({
      createYouTube: protectedProcedure.input(youtubeJobInputSchema).mutation(({ ctx, input }) => {
        return createYouTubeJob(ctx.user.id, input);
      }),
      list: protectedProcedure.query(({ ctx }) => listUserMediaJobs(ctx.user.id)),
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
