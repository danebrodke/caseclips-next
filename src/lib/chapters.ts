import chaptersData from "./chapters.json";

export interface Chapter {
  title: string;
  startTime: number;
}

const chaptersBySlug = chaptersData as Record<string, Chapter[]>;

export function getChapters(slug: string): Chapter[] {
  return chaptersBySlug[slug] ?? [];
}
