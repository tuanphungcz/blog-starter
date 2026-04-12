import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { getPosts, formatDate } from "@/lib/posts";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = getPosts();

        const items = posts
          .map((post) => {
            const date = post.publishedAt
              ? post.publishedAt.toUTCString()
              : "";
            return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteConfig.url}/${post.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/${post.slug}</guid>
      <description>${escapeXml(post.summary)}</description>
      ${date ? `<pubDate>${date}</pubDate>` : ""}
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
