# Launch plan: custom domain + Formspree for Interval Audio

## Context

The site is a Vite + `vite-react-ssg` React static site deployed to GitHub Pages via
`.github/workflows/deploy.yml`. It currently serves from the **project subpath**
`ho1yshif.github.io/interval-audio/` (`base: "/interval-audio/"` in `vite.config.js`).

Two remaining launch tasks:
1. **Custom domain** — serve the site at the apex **`interval-audio.com`** (registered at
   Squarespace, owned by a friend, currently pointing at a live Squarespace site). `www`
   redirects to the apex.
2. **Formspree** — the contact form integration is **already fully built** in
   `src/pages/Contact.jsx`; it only needs a `VITE_FORMSPREE_ID` value supplied at build time.

Decisions:
- The **friend controls DNS** and will make the record changes; the old Squarespace site
  going down is expected.
- **Apex `interval-audio.com` is canonical** (www → apex redirect).
- The Formspree ID is stored as a **GitHub Actions repository variable**.

Moving from a subpath to a root domain is low-risk because everything derives from Vite's
`BASE_URL` — nav is hash-based, `index.html` asset refs and `src/components/Image.jsx` all
follow `base` automatically. Changing `base` to `"/"` cascades correctly with no link edits.

---

## Part A — Automated code/config changes (done in-repo)

1. **`vite.config.js`** — `base: "/interval-audio/"` → `base: "/"`. Single source of truth;
   `main.jsx` basename (→ `""`) and `Image.jsx` prefix both follow automatically.
2. **`public/CNAME`** containing `interval-audio.com`. Vite copies it into `dist/`; the
   Pages deploy publishes it, setting the custom domain automatically on next deploy.
3. **`.github/workflows/deploy.yml`** — inject the Formspree ID into the build step:
   ```yaml
         - run: npm run build
           env:
             VITE_FORMSPREE_ID: ${{ vars.VITE_FORMSPREE_ID }}
   ```
4. **`bin/preview.sh`** — remove the obsolete subpath notes (local dev is now bare
   `http://localhost:<port>/`).
5. **`README.md`** — fix stale docs claiming the contact form composes a `mailto:` (it POSTs
   to Formspree).
6. **Commit + push to `main`** → triggers the deploy.
7. **Once the Formspree ID is provided**, set the Actions repo variable:
   ```
   gh variable set VITE_FORMSPREE_ID --repo Ho1yShif/interval-audio --body "<FORM_ID>"
   ```
   plus an optional local `.env` for dev, then redeploy.

---

## Part B — Steps that require you / your friend

### B1. Friend repoints DNS (Squarespace / Google Domains)
Replace the current Squarespace records with GitHub Pages records. **Leave MX / email
(SPF/DKIM TXT) records untouched.**

- **Apex `interval-audio.com` — four A records:**
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- *(Optional IPv6)* AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
  `2606:50c0:8002::153`, `2606:50c0:8003::153`
- **`www` — CNAME** → `ho1yshif.github.io`
- Remove the old Squarespace A records and the `www` → `ext-sq.squarespace.com` CNAME.

### B2. Verify domain + enable HTTPS in GitHub (after DNS propagates)
Repo → Settings → Pages: confirm `interval-audio.com` is verified, then tick **Enforce HTTPS**
once the TLS cert is provisioned (up to ~24h). Optional: add the account-level verification
TXT record to prevent domain takeover.

### B3. Create the Formspree account + form
1. Sign up at https://formspree.io (free tier).
2. Create a form; set the delivery email.
3. Copy the ID from `https://formspree.io/f/XXXXXXXX` → `XXXXXXXX`.
4. Send the ID to Claude (or add it yourself under Settings → Secrets and variables → Actions
   → Variables as `VITE_FORMSPREE_ID`).

---

## Suggested sequence
1. Claude does Part A (1–6) and pushes → deploy builds at root with CNAME.
2. Friend does B1 (DNS). In parallel, you do B3 (Formspree) and send the ID.
3. Claude sets the variable (A7) and redeploys.
4. After DNS propagates, you do B2 (verify + enforce HTTPS).

---

## Verification
- **Local:** `bin/preview.sh prod` → open the printed URL (now bare `localhost:<port>/`);
  confirm CSS/fonts/images load with no `/interval-audio/` prefixes and nav anchors work.
- **CNAME shipped:** `dist/CNAME` exists after build and equals `interval-audio.com`.
- **Deploy:** `gh run watch` / Actions tab — deploy job succeeds.
- **Domain live:** after DNS + HTTPS, load `https://interval-audio.com` and
  `https://www.interval-audio.com` (redirects to apex). `dig +short interval-audio.com A`
  returns the four `185.199.108–111.153` IPs.
- **Formspree end-to-end:** submit the contact form on the live site; confirm the Formspree
  dashboard logs it and the email arrives (no missing-ID error/`mailto` fallback).
