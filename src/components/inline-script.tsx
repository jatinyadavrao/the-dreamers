"use client";

/**
 * A script that runs while the HTML is parsed, before the first paint (Next.js "preventing flash"
 * guide). The server sends it as JavaScript; a client render keeps it inert, so it never runs twice
 * and React does not warn about rendering a script.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
