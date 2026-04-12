import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori, { init as initSatori } from "satori/standalone";
import { Resvg, initWasm as initResvg } from "@resvg/resvg-wasm";
import { parse as parseYaml } from "yaml";
import { siteConfig } from "../site.config.ts";

type SatoriNode =
  | string
  | {
      type: string;
      props: {
        style?: Record<string, unknown>;
        children?: SatoriNode | SatoriNode[];
        [key: string]: unknown;
      };
    };

interface PostFrontmatter {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
}

interface PostData {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: Date | null;
  readingTime: number;
}

interface OgImageOptions {
  title: string;
  description?: string;
  date?: string | null;
  readingTime?: number;
  tags?: string[];
  siteUrl: string;
}

const require = createRequire(import.meta.url);
const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const CONTENT_DIR = join(ROOT_DIR, "content", "blog");
const OUTPUT_DIR = join(ROOT_DIR, "public", "og");

let wasmReady = false;
let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await clearGeneratedImages();

  const [posts] = await Promise.all([loadPosts(), ensureRenderRuntime()]);

  await writeOgImage(
    "home.png",
    await renderOgImage({
      title: siteConfig.title,
      description: siteConfig.description,
      siteUrl: siteConfig.url,
    }),
  );

  await Promise.all(
    posts.map((post) =>
      writeOgImage(
        `${post.slug}.png`,
        renderOgImage({
          title: post.title,
          date: formatDate(post.publishedAt),
          readingTime: post.readingTime,
          tags: post.tags,
          siteUrl: siteConfig.url,
        }),
      ),
    ),
  );

  console.log(`Generated ${posts.length + 1} OG images in public/og`);
}

async function clearGeneratedImages() {
  const entries = await readdir(OUTPUT_DIR, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
      .map((entry) => rm(join(OUTPUT_DIR, entry.name))),
  );
}

async function ensureRenderRuntime() {
  if (wasmReady) {
    return;
  }

  const [satoriWasm, resvgWasm] = await Promise.all([
    readFile(require.resolve("satori/yoga.wasm")),
    readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm")),
  ]);

  await Promise.all([initSatori(satoriWasm), initResvg(resvgWasm)]);
  wasmReady = true;
}

async function loadFonts(): Promise<{
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}> {
  if (fontCache) {
    return fontCache;
  }

  const [regular, bold] = await Promise.all([
    fetchGoogleFont(400),
    fetchGoogleFont(700),
  ]);

  fontCache = { regular, bold };
  return fontCache;
}

async function fetchGoogleFont(weight: number): Promise<ArrayBuffer> {
  const cssResponse = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}`,
  );

  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch font CSS for weight ${weight}`);
  }

  const css = await cssResponse.text();
  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];

  if (!url) {
    throw new Error(`Font URL not found for weight ${weight}`);
  }

  const fontResponse = await fetch(url);

  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font file for weight ${weight}`);
  }

  return fontResponse.arrayBuffer();
}

async function renderOgImage(options: OgImageOptions): Promise<Uint8Array> {
  const fonts = await loadFonts();

  const svg = await satori(buildElement(options), {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "DM Sans",
        data: fonts.regular,
        weight: 400,
        style: "normal" as const,
      },
      {
        name: "DM Sans",
        data: fonts.bold,
        weight: 700,
        style: "normal" as const,
      },
    ],
  });

  return new Resvg(svg).render().asPng();
}

async function writeOgImage(filename: string, image: Promise<Uint8Array>) {
  await writeFile(join(OUTPUT_DIR, filename), await image);
}

async function loadPosts(): Promise<PostData[]> {
  const paths = await collectMarkdownFiles(CONTENT_DIR);
  const posts = await Promise.all(paths.map(loadPost));

  return posts
    .filter((post) => !post.draft)
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY) -
        (a.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY),
    )
    .map(({ draft: _draft, ...post }) => post);
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath);
      }

      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    }),
  );

  return nested.flat();
}

async function loadPost(path: string): Promise<PostData & { draft: boolean }> {
  const raw = await readFile(path, "utf8");
  const { data, content } = parseFrontmatter(raw, path);

  return {
    slug: basename(path, ".md"),
    title: data.title || basename(path, ".md"),
    summary: data.summary || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: data.draft === true,
    publishedAt: parsePublishedAt(data.date),
    readingTime: calculateReadingTime(content),
  };
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

function formatDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function buildElement(options: OgImageOptions): SatoriNode {
  const content: SatoriNode[] = [];
  const titleLen = options.title.length;
  const titleSize = titleLen > 50 ? 44 : titleLen > 30 ? 50 : 58;

  content.push({
    type: "div",
    props: {
      style: {
        width: 56,
        height: 4,
        borderRadius: 2,
        background: "linear-gradient(90deg, #f59e0b, #f97316)",
        marginBottom: 28,
      },
      children: "",
    },
  });

  content.push({
    type: "div",
    props: {
      style: {
        fontSize: titleSize,
        fontWeight: 700,
        color: "#ededec",
        lineHeight: 1.15,
        letterSpacing: -0.5,
        fontFamily: "DM Sans",
      },
      children: options.title,
    },
  });

  if (options.description) {
    content.push({
      type: "div",
      props: {
        style: {
          fontSize: 22,
          color: "#8a8a8a",
          marginTop: 20,
          lineHeight: 1.5,
          fontFamily: "DM Sans",
        },
        children: options.description,
      },
    });
  }

  const metaParts: string[] = [];

  if (options.date) {
    metaParts.push(options.date);
  }

  if (options.readingTime) {
    metaParts.push(`${options.readingTime} min read`);
  }

  if (metaParts.length > 0) {
    content.push({
      type: "div",
      props: {
        style: {
          fontSize: 18,
          color: "#666666",
          marginTop: 24,
          fontFamily: "DM Sans",
        },
        children: metaParts.join("  ·  "),
      },
    });
  }

  if (options.tags && options.tags.length > 0) {
    content.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          flexWrap: "wrap" as const,
          gap: 8,
          marginTop: 16,
        },
        children: options.tags.map((tag) => ({
          type: "span",
          props: {
            style: {
              fontSize: 14,
              color: "#a0a0a0",
              fontFamily: "DM Sans",
              border: "1px solid #333333",
              borderRadius: 999,
              paddingTop: 4,
              paddingBottom: 4,
              paddingLeft: 14,
              paddingRight: 14,
            },
            children: tag,
          },
        })),
      },
    });
  }

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        position: "relative" as const,
        width: "100%",
        height: "100%",
        background: "#09090b",
        overflow: "hidden",
        fontFamily: "DM Sans",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute" as const,
              top: -120,
              right: -80,
              width: 480,
              height: 480,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(249,115,22,0.04) 50%, transparent 70%)",
            },
            children: "",
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute" as const,
              bottom: -180,
              left: -60,
              width: 420,
              height: 420,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 60%)",
            },
            children: "",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column" as const,
              position: "relative" as const,
              width: "100%",
              height: "100%",
              padding: 64,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column" as const,
                    flex: 1,
                    justifyContent: "flex-end",
                  },
                  children: content,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: 40,
                    paddingTop: 20,
                    borderTop: "1px solid #1a1a1f",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 14,
                        color: "#4a4a4a",
                        fontFamily: "DM Sans",
                        letterSpacing: 3,
                        textTransform: "uppercase" as const,
                      },
                      children: options.siteUrl.replace(/^https?:\/\//, ""),
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

await main();
