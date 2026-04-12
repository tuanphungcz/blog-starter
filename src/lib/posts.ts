import { marked } from "marked";

marked.setOptions({ gfm: true });

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  content: string;
  html: string;
}

const modules = import.meta.glob("/content/blog/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value: unknown = line.slice(idx + 1).trim();

    // Handle arrays: ["tag1", "tag2"]
    if (typeof value === "string" && value.startsWith("[")) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        /* keep as string */
      }
    }
    // Handle booleans
    if (value === "true") value = true;
    if (value === "false") value = false;
    // Strip quotes
    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return { data, content: match[2] };
}

let _cache: Post[] | null = null;

function loadPosts(): Post[] {
  if (_cache) return _cache;

  _cache = Object.entries(modules)
    .map(([path, raw]) => {
      const slug = path.split("/").pop()!.replace(".md", "");
      const { data, content } = parseFrontmatter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        date: (data.date as string) || "",
        summary: (data.summary as string) || "",
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        draft: data.draft === true,
        content,
        html: marked.parse(content) as string,
      };
    })
    .filter((post) => !post.draft)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  return _cache;
}

export function getPosts(): Post[] {
  return loadPosts();
}

export function getPost(slug: string): Post | undefined {
  return loadPosts().find((p) => p.slug === slug);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
