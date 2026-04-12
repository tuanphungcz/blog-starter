import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { siteConfig } from "@config";
import appCss from "@/index.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: siteConfig.title },
      { name: "twitter:description", content: siteConfig.description },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
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
          <header className="border-b border-gray-100 dark:border-gray-800/50">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
              <Link
                to="/"
                className="font-heading text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
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
