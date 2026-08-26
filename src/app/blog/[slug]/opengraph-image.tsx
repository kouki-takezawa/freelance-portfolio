import { ImageResponse } from "next/og";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? siteConfig.siteName;
  const category = post?.category ?? "お知らせ";

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
        <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
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
            {category}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.3,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 28,
            color: "#B9CEE5",
          }}
        >
          {siteConfig.siteName}
        </div>
      </div>
    ),
    { ...size }
  );
}
