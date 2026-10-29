# Interval Audio

A self-hosted static rebuild of the Interval Audio portfolio site (film & media
audio services by Eli Akselrod), migrated off Squarespace onto plain
**React + Vite** with fully self-hosted, optimized assets and **no Squarespace
runtime dependency**.

## Stack

- **Vite + React** with [`vite-react-ssg`](https://github.com/daydreamer-riri/vite-react-ssg)
  — every route (including all portfolio item pages) is pre-rendered to static HTML at build time.
- **react-router-dom** for routing.
- Self-hosted fonts (Young Serif + Bitter) and locally optimized images
  (responsive WebP via `sharp`).

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # static build -> dist/
npm run preview    # serve the built dist/
```

## Content & assets

Content and images were captured from the live site into `src/data/` and
`assets/originals/`. Only the originals are in git. `npm run dev` and
`npm run build` run `scripts/optimize-images.mjs` first, which writes WebP files
to `public/img/` and the manifest to `src/data/images.json`. It skips images that
are already up to date.

To add a film, add its poster to `assets/originals/` and its entry to
`src/data/portfolio.json`, then push.

```bash
npm run extract    # re-pull content + originals  (scripts/extract-content.mjs)
npm run optimize   # regenerate responsive images  (scripts/optimize-images.mjs)
```

- `src/data/site.json` — homepage, about, contact, footer, services, social.
- `src/data/portfolio.json` — all portfolio items (title, slug, image, description, video).
- `src/data/images.json` — generated responsive-image manifest (not committed).

## Structure

```
src/
  components/   Header, Footer, Layout, Image, Reveal, PortfolioCard, SocialIcons
  pages/        Home, About, Contact, Portfolio, PortfolioItem
  data/         extracted content + image manifest
  styles/       global tokens + base styles
scripts/        one-time extraction + image optimization
public/         fonts, favicon, generated images (img/, not committed)
```

Routes are defined in `src/routes.jsx`. Note the About page is served at
**`/about-2`** (not `/about`) — the slug carried over from the original site and
the nav links to it intentionally.

## Deploy

The build outputs a fully static `dist/` with a real HTML file per route — deploy
to any static host (Render Static Site, Cloudflare Pages, Netlify, GitHub Pages).

- **Build command:** `npm run build`
- **Publish directory:** `dist`

## Notes

- The contact form POSTs to [Formspree](https://formspree.io) (`src/pages/Contact.jsx`),
  driven by the `VITE_FORMSPREE_ID` env var (see `.env.example`). If the ID is missing it
  shows an error with a `mailto:` fallback to the studio address.
- Portfolio trailers are embedded via `youtube-nocookie.com` iframes — the only
  external runtime requests, matching the original site.
