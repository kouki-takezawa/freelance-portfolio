import blogData from "../../content/blog.json";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  body: string;
  category: string;
};

export const blogPosts: BlogPost[] = [...blogData].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
