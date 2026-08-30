// マーケティング/SEO部・SNS部が「自律的に考える」ための、Claude APIへの薄いラッパー。
// ANTHROPIC_API_KEYが未設定の環境では呼び出し元でスキップされる想定。

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

export async function askClaude(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Claude API error (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text?: string }[];
  };
  const text = data.content.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Claude APIからテキスト応答を取得できませんでした");
  return text;
}

/** Claudeの応答からJSONブロックだけを取り出してパースする(```json フェンス等が混じっても許容) */
export function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claudeの応答からJSONを抽出できませんでした: " + text.slice(0, 200));
  return JSON.parse(match[0]) as T;
}
