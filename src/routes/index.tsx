import { createFileRoute, Link } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { getPosts, formatDate } from "@/lib/posts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const posts = getPosts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
            {siteConfig.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {siteConfig.bio}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="py-12 text-gray-500 dark:text-gray-400">
              No posts yet. Add your first post in{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">
                content/blog/
              </code>
            </p>
          ) : (
            <div className="-my-8 divide-y divide-gray-200 sm:-my-12 dark:divide-gray-800">
              {posts.map((post) => (
                <article key={post.slug} className="group py-8 sm:py-12">
                  <h3 className="text-base font-bold text-gray-900 transition-opacity group-hover:opacity-70 dark:text-gray-100">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2">
                    <time className="text-sm text-gray-400 dark:text-gray-500">
                      {formatDate(post.date)}
                    </time>
                    {post.tags.length > 0 && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-sm text-gray-400 dark:text-gray-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  {post.summary && (
                    <p className="mt-4 text-base leading-relaxed text-gray-500 dark:text-gray-400">
                      {post.summary}
                    </p>
                  )}
                  <div className="mt-6">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="inline-flex items-center text-sm text-gray-500 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
                    >
                      Read more
                      <svg
                        className="ml-2 h-4 w-4 transform transition-transform duration-100 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
