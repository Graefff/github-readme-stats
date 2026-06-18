import { RequestAdapter, ResponseAdapter } from "./adapter.js";
import { handler as indexHandler } from "../api/index.js";
import { handler as topLangsHandler } from "../api/top-langs.js";

export default {
  async fetch(request, env) {
    env.IS_CLOUDFLARE = "true"; // used to detect if running on Cloudflare

    const req = new RequestAdapter(request);
    const res = new ResponseAdapter();

    const { pathname } = new URL(request.url);
    if (pathname === "/") {
      return new Response(
        `<!DOCTYPE html>
          <head>
            <title>GitHub Readme Stats</title>
            <meta name="description" content="⚡ Dynamically generated stats for your github readmes" />
            <link rel="canonical" href="https://github-readme-stats.zcy.dev/" />
          </head>
          <body>
            <h1>GitHub Readme Stats</h1>
            <p>⚡ Dynamically generated stats for your github readmes</p>
            <p>
              <span style="visibility: hidden;">⚡ </span>
              <span>Hosted on Cloudflare from permanent fork: </span>
              <a href="https://github.com/harryzcy/github-readme-stats">harryzcy/github-readme-stats</a>
            </p>
          </body>
        </html>`,
        {
          headers: {
            "Content-Type": "text/html;charset=UTF-8",
            "Cache-Control": "max-age=600", // 10 min
          },
        },
      );
    }

    if (pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\nAllow: /$", {
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "Cache-Control": "max-age=600", // 10 min
        },
      });
    }

    if (pathname === "/api" || pathname === "/api/top-langs") {
      try {
        if (pathname === "/api") {
          await indexHandler(req, res, env);
        } else {
          await topLangsHandler(req, res, env);
        }

        const hasError = res.body && typeof res.body === "string" && res.body.includes("Something went wrong!");

        if (hasError) {
          let cachedResponse;
          try {
            cachedResponse = await caches.default.match(request);
          } catch (e) {
            console.error("Cache match failed:", e);
          }
          if (cachedResponse) {
            return cachedResponse;
          }
          return res.toResponse();
        } else {
          res.setHeader("X-Robots-Tag", "noindex, nofollow");
          const responseToCache = res.toResponse();
          try {
            await caches.default.put(request, responseToCache.clone());
          } catch (e) {
            console.error("Cache put failed:", e);
          }
          return responseToCache;
        }
      } catch (err) {
        console.error("Handler execution threw:", err);
        let cachedResponse;
        try {
          cachedResponse = await caches.default.match(request);
        } catch (e) {
          console.error("Cache match failed on exception:", e);
        }
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response(
          `<svg width="576.5" height="120" viewBox="0 0 576.5 120" fill="#fff" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="575.5" height="99%" rx="4.5" fill="#fff" stroke="#e4e2e2"/>
            <text x="25" y="45" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="600" font-size="16" fill="#2f3a4c">Something went wrong!</text>
            <text x="25" y="70" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="600" font-size="12" fill="#2f3a4c">${err.message || "Unknown error"}</text>
          </svg>`,
          {
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "max-age=600",
              "X-Robots-Tag": "noindex, nofollow",
            },
          }
        );
      }
    } else {
      return new Response("not found", { status: 404 });
    }
  },
};
