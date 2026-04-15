# Blog Starter

Personal blog deployed at https://tuanph.com via Cloudflare Workers.

## Deploy

```bash
npm run build && npx wrangler deploy
```

Worker name and route live in `wrangler.toml`.

## Site config

Site metadata (name, title, url, socials) lives in `site.config.ts`.

## Content

Blog posts are markdown files in `content/blog/` with YAML frontmatter (title, date, summary, tags, draft).
