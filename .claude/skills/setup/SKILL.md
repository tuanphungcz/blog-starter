---
name: setup
description: Check prerequisites, configure the blog starter, and deploy to Cloudflare Workers (CLI or auto-deploy).
---

# Setup Blog Starter

You are helping a user set up their blog from this template. Some users may be non-technical. Be patient, explain clearly, and guide them through each step. Do NOT skip the prerequisites check.

## Step 1: Check prerequisites

Run these checks silently and report what's missing:

```bash
node --version
npm --version
```

If **Node.js** is missing, stop and tell the user:
> You need Node.js installed. Go to https://nodejs.org — download the LTS version, run the installer, then restart your terminal and run `/setup` again.

Check if `node_modules` exists. If not, run `npm install` automatically.

After install, verify wrangler works: `npx wrangler --version`

## Step 2: Gather blog info

Ask the user for ALL of the following at once (to avoid back-and-forth):

1. **Name** (required) — displayed as author name
2. **Blog title** (optional, defaults to "<Name>'s Blog")
3. **Bio** (optional, one sentence about what they write about)
4. **GitHub username** (optional)
5. **Twitter/X handle** (optional)

Confirm the info before proceeding.

## Step 3: Update site.config.ts

Read `site.config.ts` and replace all placeholder values:

- `name` → user's name
- `title` → blog title
- `description` → generate a short description from their bio, or keep default
- `url` → leave as placeholder for now (will be set after deploy method is chosen)
- `bio` → user's bio or keep default
- `social.github` → GitHub username (or empty string if not provided)
- `social.twitter` → Twitter handle (or empty string if not provided)

## Step 4: Choose deploy method

Ask the user:

> How do you want to deploy your blog?
>
> **A) Auto-deploy (recommended)** — Push to GitHub, Cloudflare builds and deploys automatically. Preview URLs for every PR. No terminal needed after setup.
>
> **B) Manual CLI** — Deploy from terminal with `npm run deploy`. Faster (~10s), full control.
>
> **C) Both** — Auto-deploy on push + manual deploy when you want.

Then follow the appropriate path:

---

### Path A or C: Auto-deploy setup

#### 4a. Create GitHub repo

Check if a git remote already exists: `git remote -v`

If no remote, ask the user what they want to name their repo, then:

```bash
gh repo create <username>/<repo-name> --public --source=. --push
```

If `gh` is not installed, tell them:
> Install the GitHub CLI: https://cli.github.com — or create a repo manually at https://github.com/new and push with:
> ```
> git remote add origin git@github.com:<username>/<repo>.git
> git push -u origin main
> ```

If remote already exists, just commit and push any changes.

#### 4b. Guide Cloudflare Git integration

Tell the user:

> Now connect your GitHub repo to Cloudflare for auto-deploy:
> 1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository**
> 2. Connect your GitHub account if not already connected
> 3. Select your `<repo-name>` repository
> 4. Build settings should be auto-detected (build command: `npm run build`, deploy command: `npx wrangler deploy`)
> 5. Click **Deploy**
> 6. Tell me when the deploy succeeds

After they confirm, the blog is live on `<worker-name>.<account>.workers.dev`.

Update `site.config.ts` `url` to the workers.dev URL they got.

#### 4c. Optional: Custom domain

Ask the user:

> Do you want a custom domain? (You can skip this and add one later)

If YES, follow the custom domain setup (Step 5 below).

If NO, skip to Step 6 (Verify).

---

### Path B: Manual CLI deploy

#### 4b. Check Cloudflare auth

Run `npx wrangler whoami` to check authentication.

**If not logged in**, ask the user:

> Do you have a Cloudflare account?

- **If NO**: Tell them:
  > 1. Go to https://dash.cloudflare.com/sign-up
  > 2. Create a free account (email + password)
  > 3. Tell me when you're done

  Then run `npx wrangler login` — this opens a browser where they click "Allow".

- **If YES but not authenticated**: Run `npx wrangler login` and wait for them to complete the browser auth flow.

Verify auth succeeded with `npx wrangler whoami`.

#### 4c. Ask about custom domain

Ask the user:

> Do you want a custom domain? (You can skip this and use the free `*.workers.dev` URL)

If YES, follow the custom domain setup (Step 5 below).

If NO, update `site.config.ts` `url` to `https://markdown-blog-starter.<account>.workers.dev` and skip to deploy:

```bash
npm run build && npx wrangler deploy
```

Then go to Step 6 (Verify).

---

## Step 5: Custom domain setup (optional)

Ask:

> What domain do you want? (e.g. `myblog.com` or `blog.example.com`)

Check if the domain's zone exists:

```bash
npx wrangler zones list
```

- **If the root domain is listed**: Continue.
- **If NOT listed**: Tell them:
  > Your domain is not in Cloudflare yet:
  > 1. Go to https://dash.cloudflare.com → **Add a site**
  > 2. Enter your root domain (e.g. `example.com`)
  > 3. Select the **Free** plan
  > 4. Change your domain's nameservers to the ones Cloudflare gives you (at your domain registrar)
  > 5. Wait for Cloudflare to confirm (usually a few minutes)
  > 6. Tell me when it's done

### Update wrangler.toml

Read `wrangler.toml` and update:

- `name` → slugified domain (e.g. `myblog-com`)
- Uncomment and set `routes`:
  ```toml
  routes = [
    { pattern = "<domain>/*", zone_name = "<root-domain>" }
  ]
  ```
  `zone_name` is always the root domain (for `blog.example.com` the zone is `example.com`).

### Update site.config.ts

Set `url` to `https://<domain>`.

### DNS record

Tell the user:

> Add a DNS record in Cloudflare:
> 1. Go to https://dash.cloudflare.com → your domain → **DNS** → **Records**
> 2. **Add record**: Type = `A`, Name = `@` (or subdomain like `blog`), Content = `192.0.2.1`, Proxy = ON (orange cloud)
> 3. **Save**
> 4. Tell me when it's done

### Deploy

If using manual CLI (Path B):
```bash
npm run build && npx wrangler deploy
```

If using auto-deploy (Path A/C): commit and push the config changes:
```bash
git add -A && git commit -m "Configure custom domain" && git push
```
Cloudflare will auto-deploy.

## Step 6: Verify and next steps

Tell the user their blog is live (DNS may take a few minutes to propagate).

Then explain:
- Example posts are in `content/blog/` — edit or delete them and write your own
- Post format:
  ```yaml
  ---
  title: "My First Post"
  date: "2026-01-15"
  summary: "A short description"
  tags: ["intro"]
  ---
  Your content here...
  ```
- **Auto-deploy users**: Just push to GitHub to publish
- **CLI users**: Run `npm run deploy` to publish
- RSS feed at `/feed.xml`, sitemap at `/sitemap.xml`
