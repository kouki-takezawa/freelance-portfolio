// 各種ページの更新をブラウザへリアルタイムに反映するための、単一部屋のDurable Object。
// 承認待ち件数の変化やSNS/受注/お問い合わせの更新を検知したら、接続中の全クライアントへ
// 同じメッセージをそのまま転送するだけの薄いブロードキャスト役(状態の差分計算などは行わない)。
export class LiveRoom {
  sockets: Set<WebSocket> = new Set();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/broadcast") {
      const body = await request.text();
      for (const ws of this.sockets) {
        try {
          ws.send(body);
        } catch {
          this.sockets.delete(ws);
        }
      }
      return new Response("ok");
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.sockets.add(server);
    server.addEventListener("close", () => this.sockets.delete(server));
    server.addEventListener("error", () => this.sockets.delete(server));

    return new Response(null, { status: 101, webSocket: client });
  }
}

export async function broadcastLive(
  env: { LIVE: DurableObjectNamespace },
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const id = env.LIVE.idFromName("global");
    const stub = env.LIVE.get(id);
    await stub.fetch("https://live/broadcast", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // ライブ配信は補助的な機能のため、失敗しても本処理は継続する
  }
}
