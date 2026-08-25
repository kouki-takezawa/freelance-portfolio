const ACCOUNT_ID = "c0ef3234a9ad727b3a9d9f693fa86a17";
const GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";

export type AnalyticsSummary = {
  today: number;
  last7Days: number;
  last30Days: number;
  topPages: { path: string; count: number }[];
  dailyCounts: { date: string; count: number }[];
  available: boolean;
  errorMessage?: string;
};

function jstMidnightUtcIso(daysAgo: number): string {
  const now = new Date();
  const jstShifted = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  jstShifted.setUTCHours(0, 0, 0, 0);
  jstShifted.setUTCDate(jstShifted.getUTCDate() - daysAgo);
  return new Date(jstShifted.getTime() - 9 * 60 * 60 * 1000).toISOString();
}

async function graphql(token: string, query: string): Promise<Record<string, unknown>> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const json = (await res.json()) as {
    data?: Record<string, unknown>;
    errors?: { message: string }[];
  };
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }
  if (!json.data) throw new Error("empty_response");
  return json.data;
}

function countOf(data: Record<string, unknown>): number {
  try {
    const accounts = (data as any).viewer.accounts as { rumPageloadEventsAdaptiveGroups: { count: number }[] }[];
    return accounts[0]?.rumPageloadEventsAdaptiveGroups[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

function rangeQuery(geq: string, leq: string): string {
  return `query {
    viewer {
      accounts(filter: { accountTag: "${ACCOUNT_ID}" }) {
        rumPageloadEventsAdaptiveGroups(limit: 1, filter: { datetime_geq: "${geq}", datetime_leq: "${leq}" }) {
          count
        }
      }
    }
  }`;
}

export async function getTodayPageviews(token: string): Promise<number> {
  if (!token) return 0;
  try {
    const now = new Date().toISOString();
    const data = await graphql(token, rangeQuery(jstMidnightUtcIso(0), now));
    return countOf(data);
  } catch {
    return 0;
  }
}

function jstDateLabel(daysAgo: number): string {
  const iso = jstMidnightUtcIso(daysAgo);
  const jst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

const DAILY_CHART_DAYS = 14;

export async function getAnalyticsSummary(token: string): Promise<AnalyticsSummary> {
  const now = new Date().toISOString();
  const empty: AnalyticsSummary = {
    today: 0,
    last7Days: 0,
    last30Days: 0,
    topPages: [],
    dailyCounts: [],
    available: false,
  };

  if (!token) {
    return { ...empty, errorMessage: "CF_ANALYTICS_TOKEN が未設定です" };
  }

  try {
    const [todayData, week, month, topPagesData, dailyData] = await Promise.all([
      graphql(token, rangeQuery(jstMidnightUtcIso(0), now)),
      graphql(token, rangeQuery(jstMidnightUtcIso(6), now)),
      graphql(token, rangeQuery(jstMidnightUtcIso(29), now)),
      graphql(
        token,
        `query {
          viewer {
            accounts(filter: { accountTag: "${ACCOUNT_ID}" }) {
              rumPageloadEventsAdaptiveGroups(
                limit: 8
                orderBy: [count_DESC]
                filter: { datetime_geq: "${jstMidnightUtcIso(29)}", datetime_leq: "${now}" }
              ) {
                count
                dimensions { requestPath }
              }
            }
          }
        }`
      ),
      graphql(
        token,
        `query {
          viewer {
            accounts(filter: { accountTag: "${ACCOUNT_ID}" }) {
              rumPageloadEventsAdaptiveGroups(
                limit: ${DAILY_CHART_DAYS}
                orderBy: [date_ASC]
                filter: { datetime_geq: "${jstMidnightUtcIso(DAILY_CHART_DAYS - 1)}", datetime_leq: "${now}" }
              ) {
                count
                dimensions { date }
              }
            }
          }
        }`
      ),
    ]);

    const topPages = (() => {
      try {
        const accounts = (topPagesData as any).viewer.accounts as {
          rumPageloadEventsAdaptiveGroups: { count: number; dimensions: { requestPath: string } }[];
        }[];
        return (accounts[0]?.rumPageloadEventsAdaptiveGroups ?? []).map((g) => ({
          path: g.dimensions.requestPath || "/",
          count: g.count,
        }));
      } catch {
        return [];
      }
    })();

    const dailyMap = (() => {
      const map = new Map<string, number>();
      try {
        const accounts = (dailyData as any).viewer.accounts as {
          rumPageloadEventsAdaptiveGroups: { count: number; dimensions: { date: string } }[];
        }[];
        for (const g of accounts[0]?.rumPageloadEventsAdaptiveGroups ?? []) {
          map.set(g.dimensions.date, (map.get(g.dimensions.date) ?? 0) + g.count);
        }
      } catch {
        // ignore
      }
      return map;
    })();

    const dailyCounts = Array.from({ length: DAILY_CHART_DAYS }, (_, i) => {
      const date = jstDateLabel(DAILY_CHART_DAYS - 1 - i);
      return { date, count: dailyMap.get(date) ?? 0 };
    });

    return {
      today: countOf(todayData),
      last7Days: countOf(week),
      last30Days: countOf(month),
      topPages,
      dailyCounts,
      available: true,
    };
  } catch (err) {
    return { ...empty, errorMessage: (err as Error).message };
  }
}
