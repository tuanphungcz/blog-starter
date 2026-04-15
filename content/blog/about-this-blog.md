---
title: "About this blog (and how to get your own in 5 minutes)"
date: "2026-04-11"
summary: "This blog is open source. Markdown posts, RSS, sitemap, auto-generated OG images, dark mode, deployed to Cloudflare Workers. Fork it, edit one config file, ship."
tags: ["meta", "markdown-blog-starter"]
---

This blog runs on [**markdown-blog-starter**](https://github.com/tuanphungcz/markdown-blog-starter) — a small stack I built for myself and open sourced. If you want a personal blog that is fast, free to host, and easy to edit, clone it:

```bash
git clone https://github.com/tuanphungcz/markdown-blog-starter
cd markdown-blog-starter
npm install
npm run deploy
```

Or click **Deploy to Cloudflare** in the README and skip the terminal entirely.

---

## What it does

- **Markdown posts** with YAML frontmatter (title, date, summary, tags, draft)
- **RSS feed** at `/feed.xml`, sitemap at `/sitemap.xml`, plus `robots.txt`
- **Auto-generated OG images** for every post (via Satori)
- **Reading time** estimated from word count
- **Dark and light mode** that follows your system preference
- **Deployed to Cloudflare Workers** — free tier is plenty, edge-fast everywhere
- **No bloat** — TanStack Start, Tailwind, `marked`. That's it.

One config file (`site.config.ts`) controls your name, domain, and socials. One folder (`content/blog/`) holds your posts. That's the whole mental model.

---

## What a post looks like

The frontmatter is plain YAML:

```markdown
---
title: "My first post"
date: "2026-04-15"
summary: "Short description used for the listing page and RSS."
tags: ["intro"]
---

Your markdown here...
```

Set `draft: true` to keep a post out of the listing while you work on it.

---

## Formatting examples

Everything you'd expect from markdown works. Here's what you get out of the box.

### Headings, emphasis, links

**Bold** and *italic* render the way you'd expect. Links like [**markdown-blog-starter on GitHub**](https://github.com/tuanphungcz/markdown-blog-starter) use the convention of putting the bold inside the brackets — `[**text**](url)` — so the underline matches the bold weight.

### Lists

- Bullet points
- Work fine
- Nested too:
  - Like this
  - And this

1. Numbered lists
2. Also work
3. In the obvious way

### Blockquotes

> Quotes render with a left border and muted text. Handy for pulling out a line from a source or an old tweet.

### Code

Inline code like `npm run deploy` sits nicely in a sentence. Fenced blocks get a monospace font and a subtle background:

```ts
// site.config.ts
export const siteConfig = {
  name: "Your Name",
  title: "Your Blog",
  url: "https://yourdomain.com",
  social: {
    github: "yourhandle",
    twitter: "yourhandle",
  },
};
```

### Tables

| Feature             | Where it lives              |
| ------------------- | --------------------------- |
| Site metadata       | `site.config.ts`            |
| Posts               | `content/blog/*.md`         |
| Deploy config       | `wrangler.toml`             |
| Routes              | `src/routes/`               |

### Horizontal rules

Use `---` on its own line to drop a divider, like the ones separating sections in this post.

---

## The whole workflow

1. Write a markdown file in `content/blog/`.
2. Run `npm run deploy`.
3. It's live.

That's it. No CMS, no database, no build pipeline to babysit. If you can edit a text file, you can run this blog.

Fork it, make it yours, and send me the URL — I'd love to read what you write.
