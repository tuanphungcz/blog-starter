import { createFileRoute, Link } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { formatDate, getAdjacentPosts, getPost } from "@/lib/posts";
import { getPostOgImageUrl } from "@/lib/og-meta";

export const Route = createFileRoute("/$blogid")({
  head: ({ params }) => {
    const post = getPost(params.blogid);
    if (!post) return {};
    const ogImageUrl = getPostOgImageUrl(siteConfig.url, post);

    const meta = [
      { title: `${post.title} — ${siteConfig.title}` },
      { name: "description", content: post.summary },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.summary },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${siteConfig.url}/${params.blogid}` },
      { property: "og:image", content: ogImageUrl },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: post.summary },
      { name: "twitter:image", content: ogImageUrl },
    ];

    if (post.publishedAt) {
      meta.push({
        property: "article:published_time",
        content: post.publishedAt.toISOString(),
      });
    }

    return {
      meta,
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { blogid } = Route.useParams();
  const post = getPost(blogid);

  if (!post) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Post not found
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          Go back home
        </Link>
      </div>
    );
  }

  const { prevPost, nextPost } = getAdjacentPosts(blogid);
  const formattedDate = formatDate(post.publishedAt);

  return (
    <article>
      {/* Header */}
      <header className="bg-gray-100 py-12 sm:py-16 lg:py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-2">
            {formattedDate && (
              <time className="text-sm text-gray-400 dark:text-gray-500">
                {formattedDate}
              </time>
            )}
            {formattedDate && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {post.readingTime} min read
                </span>
              </>
            )}
            {post.tags.length > 0 && (
              <span className="text-gray-300 dark:text-gray-600">·</span>
            )}
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-gray-400 dark:text-gray-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div
          className="prose prose-gray dark:prose-invert prose-headings:tracking-tight"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* Footer: prev/next + back */}
        <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              {prevPost && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Previous
                  </p>
                  <Link
                    to="/$blogid"
                    params={{ blogid: prevPost.slug }}
                    className="mt-2 inline-block text-sm font-medium text-gray-900 hover:opacity-70 dark:text-gray-100"
                  >
                    {prevPost.title}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex-1 text-right">
              {nextPost && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Next
                  </p>
                  <Link
                    to="/$blogid"
                    params={{ blogid: nextPost.slug }}
                    className="mt-2 inline-block text-sm font-medium text-gray-900 hover:opacity-70 dark:text-gray-100"
                  >
                    {nextPost.title}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Link
              to="/"
              className="group inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg
                className="mr-2 h-4 w-4 transform transition-transform duration-100 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Back to all posts
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
