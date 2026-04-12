import { createFileRoute, Link } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { getPostsByTag, formatDate } from "@/lib/posts";

export const Route = createFileRoute("/tags/$tag")({
  head: ({ params }) => ({
    meta: [
      { title: `#${params.tag} — ${siteConfig.title}` },
      {
        name: "description",
        content: `Posts tagged with #${params.tag} on ${siteConfig.title}`,
      },
    ],
  }),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useParams();
  const posts = getPostsByTag(tag);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          to="/tags"
          className="text-sm text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100"
        >
          Tags
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          #{tag}
        </h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-gray-500 dark:text-gray-400">
          No posts with this tag.
        </p>
      ) : (
        <div className="mt-8 -my-8 divide-y divide-gray-200 sm:-my-12 dark:divide-gray-800">
          {posts.map((post) => {
            const formattedDate = formatDate(post.publishedAt);

            return (
              <article key={post.slug} className="group py-8 sm:py-12">
                <h3 className="text-base font-bold text-gray-900 transition-opacity group-hover:opacity-70 dark:text-gray-100">
                  <Link to="/$blogid" params={{ blogid: post.slug }}>
                    {post.title}
                  </Link>
                </h3>
                {formattedDate && (
                  <div className="mt-2 flex items-center gap-x-2">
                    <time className="text-sm text-gray-400 dark:text-gray-500">
                      {formattedDate}
                    </time>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {post.readingTime} min read
                    </span>
                  </div>
                )}
                {post.summary && (
                  <p className="mt-4 text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    {post.summary}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
