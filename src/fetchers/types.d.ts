export type StatsData = {
  name: string;
  totalPRs: number;
  totalPRsMerged: number;
  mergedPRsPercentage: number;
  totalReviews: number;
  totalCommits: number;
  totalIssues: number;
  totalStars: number;
  totalDiscussionsStarted: number;
  totalDiscussionsAnswered: number;
  contributedTo: number;
  rank: { level: string; percentile: number };
};

export type Lang = {
  name: string;
  color: string;
  size: number;
};

export type TopLangData = Record<string, Lang>;
