# Blog Starter

A minimal, fast blog built with [TanStack Start](https://tanstack.com/start), [Tailwind CSS](https://tailwindcss.com), and [Cloudflare Workers](https://workers.cloudflare.com).

**[Live Demo](https://markdown-blog-starter.tuanph.com)**

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tuanphungcz/blog-starter)

## Features

- Markdown blog posts with YAML frontmatter
- RSS feed (`/feed.xml`), sitemap (`/sitemap.xml`), robots.txt
- Reading time estimation
- Dark/light mode (follows system preference)
- Fast — deploys to Cloudflare's edge network
- Minimal — no unnecessary dependencies

## Quick Start

### One-click deploy

Click the **Deploy to Cloudflare** button above. Done. Your blog will be live at `blog-starter.<your-account>.workers.dev`.

### With Claude Code

```bash
git clone https://github.com/tuanphungcz/blog-starter
cd blog-starter
npm install
```

Then run `/setup` — Claude will configure your domain, name, socials, and deploy.

### Manual setup

```bash
git clone https://github.com/tuanphungcz/blog-starter
cd blog-starter
npm install
```

Edit `site.config.ts` with your info, then:

```bash
npx wrangler login
npm run deploy
```

## Writing Posts

Add markdown files to `content/blog/`:

```markdown
---
title: "My First Post"
date: "2026-01-15"
summary: "A short description"
tags: ["intro"]
---

Your content here...
```

Run `npm run deploy` to publish.

## Custom Domain

1. Add your domain to [Cloudflare](https://dash.cloudflare.com)
2. Add a proxied A record (`@` → `192.0.2.1`)
3. Edit `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```
4. `npm run deploy`

## Development

```bash
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build
npm run deploy  # Build + deploy to Cloudflare
```
