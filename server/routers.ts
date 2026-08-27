import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createPluggyConnectToken, fetchPluggyAccounts, fetchPluggyTransactions, normalizePluggyAccount, normalizePluggyTransaction } from "./pluggy";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  pluggy: router({
    createConnectToken: publicProcedure
      .input(z.object({ clientUserId: z.string().min(1).max(128), oauthRedirectUri: z.string().url().optional() }))
      .mutation(({ input }) => createPluggyConnectToken(input)),
    syncItem: publicProcedure
      .input(z.object({ itemId: z.string().min(1) }))
      .query(async ({ input }) => {
        const accountsResponse = await fetchPluggyAccounts(input.itemId);
        const accounts = (accountsResponse.results ?? []).map(normalizePluggyAccount);
        const transactions = (await Promise.all(
          (accountsResponse.results ?? []).map(async (account) => {
            const response = await fetchPluggyTransactions(account.id);
            return (response.results ?? []).map(normalizePluggyTransaction);
          }),
        )).flat();
        return { accounts, transactions };
      }),
  }),
});

export type AppRouter = typeof appRouter;
