import type { Post } from "@/lib/posts";

function hashOgVersion(seed: string): string {
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function buildOgImageUrl(siteUrl: string, slug: string, versionSeed: string) {
  const url = new URL(`/og/${slug}.png`, siteUrl);
  url.searchParams.set("v", hashOgVersion(versionSeed));
  return url.toString();
}

export function getHomeOgImageUrl(options: {
  siteUrl: string;
  title: string;
  description: string;
}) {
  const versionSeed = [
    options.siteUrl,
    options.title,
    options.description,
  ].join("|");

  return buildOgImageUrl(options.siteUrl, "home", versionSeed);
}

export function getPostOgImageUrl(
  siteUrl: string,
  post: Pick<Post, "slug" | "title" | "publishedAt" | "readingTime" | "tags">,
) {
  const versionSeed = [
    siteUrl,
    post.slug,
    post.title,
    post.publishedAt?.toISOString() ?? "",
    String(post.readingTime),
    post.tags.join(","),
  ].join("|");

  return buildOgImageUrl(siteUrl, post.slug, versionSeed);
}
