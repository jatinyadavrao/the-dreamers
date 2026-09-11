import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Page routes that require sign-in. API routes self-guard and return
// JSON 401/403 from their handlers (auth() / isAdmin()).
const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/companies(.*)",
  "/questions(.*)",
  "/compare(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files, always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ico|webp|woff2?|ttf|mp3|wav)).*)",
    "/(api|trpc)(.*)",
  ],
};
