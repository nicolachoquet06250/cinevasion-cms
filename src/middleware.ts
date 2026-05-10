import { getSession } from "auth-astro/server";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/admin")) {
    const session = await getSession(context.request);
    if (!session) {
      return context.redirect("/login");
    }
  }
  return next();
});
