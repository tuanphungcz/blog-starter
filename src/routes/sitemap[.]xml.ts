import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { getPosts } from "@/lib/posts";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = getPosts();

        const urls = [
          `  <url>
    <loc>${siteConfig.url}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
          `  <url>
    <loc>${siteConfig.url}/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`,
          ...posts.map(
            (post) => `  <url>
    <loc>${siteConfig.url}/${post.slug}</loc>
    ${post.publishedAt ? `<lastmod>${post.publishedAt.toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
          ),
        ].join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

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
