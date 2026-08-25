import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#1E3A5F",
          backgroundImage:
            "radial-gradient(circle at 85% 30%, rgba(255,255,255,0.10) 0, transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              color: "#DCE8F5",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            HP・LP・システム/Webアプリ開発
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.25,
            maxWidth: 920,
          }}
        >
          {siteConfig.siteName}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            color: "#B9CEE5",
            maxWidth: 880,
            lineHeight: 1.5,
          }}
        >
          小さな会社・個人事業主のための、ちょうどいい規模のWeb制作
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 90,
            bottom: 80,
          }}
        >
          <svg width="220" height="200" viewBox="0 0 220 200">
            <polygon
              points="110,20 190,64 110,108 30,64"
              fill="#7FB0E0"
            />
            <polygon points="30,64 110,108 110,190 30,146" fill="#12283F" />
            <polygon points="190,64 110,108 110,190 190,146" fill="#2F5A8A" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
