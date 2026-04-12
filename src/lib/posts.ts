import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/common";
import { parse as parseYaml } from "yaml";

const marked = new Marked(
  { gfm: true },
  markedHighlight({
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  }),
);

export interface Post {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  draft: boolean;
  content: string;
  html: string;
  publishedAt: Date | null;
  readingTime: number;
}

const modules = import.meta.glob("/content/blog/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

interface PostFrontmatter {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
}

function parseFrontmatter(
  raw: string,
  path: string,
): { data: PostFrontmatter; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { data: {}, content: raw };
  }

  try {
    const parsed = parseYaml(match[1]);
    const data =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as PostFrontmatter)
        : {};

    return {
      data,
      content: raw.slice(match[0].length),
    };
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${path}`, { cause: error });
  }
}

function parsePublishedAt(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const publishedAt = new Date(value);
  return Number.isNaN(publishedAt.getTime()) ? null : publishedAt;
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const posts = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(".md", "");
    const { data: frontmatter, content } = parseFrontmatter(raw, path);

    return {
      slug,
      title: frontmatter.title || slug,
      summary: frontmatter.summary || "",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      draft: frontmatter.draft === true,
      content,
      html: marked.parse(content) as string,
      publishedAt: parsePublishedAt(frontmatter.date),
      readingTime: calculateReadingTime(content),
    };
  })
  .filter((post) => !post.draft)
  .sort(
    (a, b) =>
      (b.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY) -
      (a.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY),
  );

const postsBySlug = new Map(posts.map((post) => [post.slug, post]));

export function getPosts(): Post[] {
  return posts;
}

export function getPost(slug: string): Post | undefined {
  return postsBySlug.get(slug);
}

export function getPostsByTag(tag: string): Post[] {
  return posts.filter((post) => post.tags.includes(tag));
}

export function getAllTags(): { tag: string; count: number }[] {
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAdjacentPosts(slug: string): {
  prevPost: Post | null;
  nextPost: Post | null;
} {
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) {
    return { prevPost: null, nextPost: null };
  }

  return {
    prevPost:
      currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    nextPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

export function formatDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
