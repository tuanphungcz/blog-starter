import { createFileRoute, Link } from "@tanstack/react-router";
import { siteConfig } from "@config";
import { getAllTags } from "@/lib/posts";

export const Route = createFileRoute("/tags/")({
  head: () => ({
    meta: [
      { title: `Tags — ${siteConfig.title}` },
      { name: "description", content: `Browse all tags on ${siteConfig.title}` },
    ],
  }),
  component: TagsPage,
});

function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Tags
      </h1>
      {tags.length === 0 ? (
        <p className="mt-8 text-gray-500 dark:text-gray-400">No tags yet.</p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              to="/tags/$tag"
              params={{ tag }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              #{tag}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
