import seoData from "../../content/seo.json";

export type SeoEntry = {
  title: string;
  description: string;
};

const seo: Record<string, SeoEntry> = seoData;

export function getSeo(path: keyof typeof seoData): SeoEntry {
  return seo[path];
}
