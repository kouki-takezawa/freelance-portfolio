// Cloudflare Pages Function: /api/contact
// フォーム送信を受け取るエンドポイント。
// TODO: 送信先メールアドレスが決まったら、Resend等のメールAPIを呼び出す処理をここに実装してください。
//       (例: env.RESEND_API_KEY を Cloudflare Pages の環境変数に設定し、fetch でResend APIを呼び出す)

export async function onRequestPost(context) {
  const { request } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, inquiryType, message } = data ?? {};

  if (!name || !email || !inquiryType || !message) {
    return new Response(JSON.stringify({ error: "missing_fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 現時点では送信先メール未設定のため、受信ログのみ残して成功を返す仮実装。
  console.log("New contact form submission:", {
    name,
    email,
    inquiryType,
    budget: data.budget ?? "",
    message,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
