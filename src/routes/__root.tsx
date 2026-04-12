import type { ReactNode } from "react";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { siteConfig } from "@config";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteConfig.title },
      { name: "description", content: siteConfig.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteConfig.title },
      { property: "og:title", content: siteConfig.title },
      { property: "og:description", content: siteConfig.description },
      { property: "og:url", content: siteConfig.url },
      { property: "og:image", content: `${siteConfig.url}/og/home` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: siteConfig.title },
      { name: "twitter:description", content: siteConfig.description },
      { name: "twitter:image", content: `${siteConfig.url}/og/home` },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: siteConfig.title,
        href: "/feed.xml",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function toggleTheme() {
  const root = document.documentElement;
  const nextDark = !root.classList.contains("dark");
  root.classList.toggle("dark", nextDark);
  localStorage.setItem("theme", nextDark ? "dark" : "light");
}

function ThemeToggle() {
  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      aria-label="Toggle dark mode"
    >
      Theme
    </button>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="bg-white font-sans text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="flex min-h-screen flex-col">
          {/* Navigation */}
          <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg dark:border-gray-800/50 dark:bg-gray-950/80">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
              <Link
                to="/"
                className="text-base font-bold text-gray-900 dark:text-gray-100"
              >
                {siteConfig.title}
              </Link>
              <nav className="flex items-center gap-1">
                {siteConfig.social.github && (
                  <a
                    href={`https://github.com/${siteConfig.social.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100"
                  >
                    GitHub
                  </a>
                )}
                {siteConfig.social.twitter && (
                  <a
                    href={`https://x.com/${siteConfig.social.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100"
                  >
                    Twitter
                  </a>
                )}
                <ThemeToggle />
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-gray-100 dark:border-gray-800/50">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                &copy; {new Date().getFullYear()} {siteConfig.name}
              </p>
            </div>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
