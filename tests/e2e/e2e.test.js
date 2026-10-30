/**
 * @file Contains end-to-end tests for the preview instance.
 */
import dotenv from "dotenv";
dotenv.config();

import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { renderStatsCard } from "../../src/cards/stats.js";
import { renderTopLanguages } from "../../src/cards/top-languages.js";

const USER = "catelinemnemosyne";
const STATS_CARD_USER = "e2eninja";

const STATS_DATA = {
  name: "CodeNinja",
  totalPRs: 1,
  totalReviews: 0,
  totalCommits: 3,
  totalIssues: 1,
  totalStars: 1,
  contributedTo: 0,
  rank: {
    level: "C",
    percentile: 98.73972605284538,
  },
};

const LANGS_DATA = {
  HTML: {
    color: "#e34c26",
    name: "HTML",
    size: 1721,
  },
  CSS: {
    color: "#663399",
    name: "CSS",
    size: 930,
  },
  JavaScript: {
    color: "#f1e05a",
    name: "JavaScript",
    size: 1912,
  },
};

const CACHE_BURST_STRING = `v=${new Date().getTime()}`;

describe("Fetch Cards", () => {
  let VERCEL_PREVIEW_URL;

  beforeAll(() => {
    process.env.NODE_ENV = "development";
    VERCEL_PREVIEW_URL = process.env.VERCEL_PREVIEW_URL;
  });

  test("retrieve stats card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    // Check if the preview instance stats card function is up and running.
    await expect(
      axios.get(`${VERCEL_PREVIEW_URL}/api?username=${STATS_CARD_USER}`),
    ).resolves.not.toThrow();

    // Get local stats card.
    const localStatsCardSVG = renderStatsCard(STATS_DATA, {
      include_all_commits: true,
    });

    // Get the preview stats card response.
    const serverStatsSvg = await axios.get(
      `${VERCEL_PREVIEW_URL}/api?username=${STATS_CARD_USER}&include_all_commits=true&${CACHE_BURST_STRING}`,
    );

    // Check if stats card from deployment matches the stats card from local.
    expect(serverStatsSvg.data).toEqual(localStatsCardSVG);
  }, 15000);

  test("retrieve language card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    // Check if the preview instance language card function is up and running.
    await expect(
      axios.get(
        `${VERCEL_PREVIEW_URL}/api/top-langs/?username=${USER}&${CACHE_BURST_STRING}`,
      ),
    ).resolves.not.toThrow();

    // Get local language card.
    const localLanguageCardSVG = renderTopLanguages(LANGS_DATA);

    // Get the preview language card response.
    const severLanguageSVG = await axios.get(
      `${VERCEL_PREVIEW_URL}/api/top-langs/?username=${USER}&${CACHE_BURST_STRING}`,
    );

    // Check if language card from deployment matches the local language card.
    expect(severLanguageSVG.data).toEqual(localLanguageCardSVG);
  }, 15000);
});
