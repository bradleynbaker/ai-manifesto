// Vercel Routing Middleware: one shared password in front of the whole site (HTTP Basic auth).
// The password lives in the Vercel project's environment (TALK_PASSWORD), never in this repo.
// Any username works. If TALK_PASSWORD is unset, the site stays locked.
export const config = { matcher: "/:path*" };

export default function middleware(request) {
  const expected = (process.env.TALK_PASSWORD || "").trim();
  const header = request.headers.get("authorization") || "";
  if (expected && header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if (password === expected) return; // let the request through
    } catch {}
  }
  return new Response("This talk is private. Enter the password you were given (any username).", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="An AI Manifesto", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}
