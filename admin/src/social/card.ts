import satori, { init as initSatori } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import yogaWasmModule from "yoga-wasm-web/dist/yoga.wasm";
import { Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
import resvgWasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import encodeJpeg, { init as initJpegEncode } from "@jsquash/jpeg/encode";
import jpegEncWasmModule from "@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm";

const CARD_SIZE = 1080;
const FONT_NAME = "Noto Sans JP";

// 30日分並べたときに単調なテンプレート感が出ないよう、配色パターンを数種類用意して日替わりで使う
const CARD_VARIANTS = [
  {
    background: "#1E3A5F",
    headline: "#ffffff",
    wordmark: "#7FB0E0",
    chipBackground: "rgba(255,255,255,0.12)",
    chipColor: "#DCE8F5",
    accent: "#2F5A8A",
  },
  {
    background: "#F3EFE6",
    headline: "#1E3A5F",
    wordmark: "#8A6F4E",
    chipBackground: "rgba(30,58,95,0.08)",
    chipColor: "#1E3A5F",
    accent: "#D8CBB0",
  },
  {
    background: "#E9F1FA",
    headline: "#12283F",
    wordmark: "#2F5A8A",
    chipBackground: "rgba(18,40,63,0.08)",
    chipColor: "#12283F",
    accent: "#B9D4EE",
  },
] as const;

let wasmInitialized = false;
async function ensureWasmInitialized(): Promise<void> {
  if (wasmInitialized) return;
  const yoga = await initYoga(yogaWasmModule);
  initSatori(yoga);
  await initResvgWasm(resvgWasmModule);
  await initJpegEncode(jpegEncWasmModule);
  wasmInitialized = true;
}

// フォントはJSバンドルに含めず、Workers Assetsから都度取得してisolate内でキャッシュする
// (バンドルに直接含めるとWorkerのアップロードサイズ上限を圧迫するため)
let cachedFontData: ArrayBuffer | null = null;
async function getFontData(assets: Fetcher): Promise<ArrayBuffer> {
  if (cachedFontData) return cachedFontData;
  const res = await assets.fetch(new Request("https://social-card.internal/fonts/NotoSansJP-Bold.otf"));
  if (!res.ok) {
    throw new Error(`カード用フォントの読み込みに失敗しました: ${res.status}`);
  }
  cachedFontData = await res.arrayBuffer();
  return cachedFontData;
}

export async function generateCardImage(
  assets: Fetcher,
  content: { headline: string; category: string; variant: number }
): Promise<ArrayBuffer> {
  await ensureWasmInitialized();
  const fontData = await getFontData(assets);
  const v = CARD_VARIANTS[((content.variant % CARD_VARIANTS.length) + CARD_VARIANTS.length) % CARD_VARIANTS.length];

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 100,
          backgroundColor: v.background,
          fontFamily: FONT_NAME,
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                top: 0,
                right: 0,
                width: 260,
                height: 260,
                backgroundColor: v.accent,
                opacity: 0.5,
                transform: "translate(90px, -90px) rotate(45deg)",
              },
              children: [],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: v.wordmark,
                marginBottom: 28,
              },
              children: "ヨリソイワークス",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                padding: "6px 18px",
                borderRadius: 999,
                background: v.chipBackground,
                color: v.chipColor,
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 36,
                alignSelf: "flex-start",
              },
              children: content.category,
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.5,
                color: v.headline,
                whiteSpace: "pre-wrap",
              },
              children: content.headline,
            },
          },
        ],
      },
    },
    {
      width: CARD_SIZE,
      height: CARD_SIZE,
      fonts: [{ name: FONT_NAME, data: fontData, weight: 700, style: "normal" }],
    }
  );

  const resvg = new Resvg(svg);
  const rendered = resvg.render();
  const imageData = {
    data: rendered.pixels,
    width: rendered.width,
    height: rendered.height,
  } as unknown as ImageData;

  return encodeJpeg(imageData, { quality: 88 });
}
