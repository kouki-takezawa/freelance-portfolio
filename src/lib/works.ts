import worksData from "../../content/works.json";

export type WorkCase = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  points: string[];
  isSample: boolean;
};

export const works: WorkCase[] = worksData;
