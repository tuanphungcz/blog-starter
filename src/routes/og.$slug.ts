import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { getPost, formatDate } from "@/lib/posts";
import { generateOgImage } from "@/lib/og";
import type { OgImageOptions } from "@/lib/og";

export const Route = createFileRoute("/og/$slug")({
  server: {
    handlers: {
      GET: async ({
        params,
      }: {
        request: Request;
        params: { slug: string };
      }) => {
        try {
          const { slug } = params;

          let options: OgImageOptions;

          if (slug === "home") {
            options = {
              title: siteConfig.title,
              description: siteConfig.description,
              siteUrl: siteConfig.url,
            };
          } else {
            const post = getPost(slug);
            if (!post) {
              return new Response("Not found", { status: 404 });
            }
            options = {
              title: post.title,
              date: formatDate(post.publishedAt),
              readingTime: post.readingTime,
              tags: post.tags,
              siteUrl: siteConfig.url,
            };
          }

          const png = await generateOgImage(options);

          return new Response(png, {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=604800",
            },
          });
        } catch (error) {
          const msg = error instanceof Error ? error.stack || error.message : String(error);
          return new Response(msg, { status: 500, headers: { "Content-Type": "text/plain" } });
        }
      },
    },
  },
});
