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

    if (pathname === "/api") {
      await indexHandler(req, res, env);
    } else if (pathname === "/api/top-langs") {
      await topLangsHandler(req, res, env);
    } else {
      return new Response("not found", { status: 404 });
    }

    res.setHeader("Cache-Control", "max-age=600"); // 10 min
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.toResponse();
  },
};
