import satori, { init as initSatori } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import yogaWasmModule from "yoga-wasm-web/dist/yoga.wasm";
import { Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
import resvgWasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import encodeJpeg, { init as initJpegEncode } from "@jsquash/jpeg/encode";
import jpegEncWasmModule from "@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm";

const CARD_SIZE = 1080;
const FONT_NAME = "Noto Sans JP";
const BRAND_COLOR = "#1E3A5F";
const ACCENT_COLOR = "#7FB0E0";

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
  headline: string
): Promise<ArrayBuffer> {
  await ensureWasmInitialized();
  const fontData = await getFontData(assets);

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
          backgroundColor: BRAND_COLOR,
          fontFamily: FONT_NAME,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: 32,
                fontWeight: 700,
                color: ACCENT_COLOR,
                marginBottom: 48,
              },
              children: "ヨリソイワークス",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.5,
                color: "#ffffff",
                whiteSpace: "pre-wrap",
              },
              children: headline,
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
