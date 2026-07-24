# SendGrid Link Branding SSL Proxy — Bequesta

This is a minimal reverse proxy that forwards all traffic from your SendGrid
Link Branding subdomain (`url3059.bequesta.ca`) to SendGrid's servers
(`sendgrid.net`), while letting Vercel handle SSL for your custom domain.

This solves the "Your connection is not private" / NET::ERR_CERT_COMMON_NAME_INVALID
error, since SendGrid's default certificate doesn't cover your custom branded
subdomain, but Vercel will auto-issue and auto-renew a certificate for it.

This mirrors the same working setup built for HeirWise (`url9641.heirwise.ca`)
and Livestockr (`url4469.livestockr.ca`), adapted for Bequesta's branded domain.

## IMPORTANT — avoid the folder-nesting mistake

When copying these files into your repo, `api/proxy.js` must sit directly at
the **repo root** — not nested inside a subfolder like `sendgrid-bequesta/api/proxy.js`.
A nested structure causes Vercel to return a 404 NOT_FOUND because it can't
find the function or match the vercel.json rewrite.

After copying files in, confirm the structure from inside your repo folder:
```
find . -not -path './.git/*' -type f
```
Expected output:
```
./api/proxy.js
./vercel.json
./package.json
./README.md
```
If you see an extra folder level, flatten it before committing.

## Deploy Option A — via GitHub (recommended)

1. Clone this repo (already created at blu-geek/sendgrid-bequesta):
   ```
   git clone https://github.com/blu-geek/sendgrid-bequesta.git
   cd sendgrid-bequesta
   ```
2. Copy these files directly into the repo root (api/proxy.js, vercel.json,
   package.json, README.md) — see structure check above
3. Commit and push:
   ```
   git add .
   git commit -m "Initial SendGrid link branding SSL proxy for Bequesta"
   git branch -M main
   git push -u origin main
   ```
4. Go to https://vercel.com/new and import the `sendgrid-bequesta` repo
5. Click Deploy — no build settings needed

## Deploy Option B — via Vercel CLI (no GitHub needed)

1. Install the CLI:
   ```
   npm install -g vercel
   ```
2. From inside this folder, run:
   ```
   vercel
   ```
3. Follow the prompts and accept defaults

## After deploying

1. In the Vercel dashboard, go to your project → Settings → Domains
2. Add `url3059.bequesta.ca`
3. Vercel will show a CNAME target, usually something like `xxxxxxxx.vercel-dns-017.com`
   or `cname.vercel-dns.com`
4. In GoDaddy DNS for bequesta.ca, edit the existing `url3059` CNAME record
   (currently pointing to SendGrid) to point to that Vercel target instead
5. Wait for DNS to propagate (check with: `dig CNAME url3059.bequesta.ca +short`)
6. Vercel will auto-issue an SSL certificate for the subdomain once DNS resolves
7. Test by visiting a real tracked link from a Bequesta SendGrid email —
   it should load without a certificate warning, and correctly redirect
   (not show a SendGrid "Wrong Link" error)
8. Contact SendGrid support to enable "SSL for Click and Open Tracking" on
   the Bequesta sending account now that the proxy is confirmed working

## Notes

- The branded subdomain is set in `YOUR_DOMAIN` inside `api/proxy.js`
  (currently `url3059.bequesta.ca`) — update if SendGrid issues a
  different link branding hostname later.
- `servername: SENDGRID_HOST` is required — without it, Node validates
  the TLS certificate against the Host header instead of the actual
  connection target, causing a "Hostname/IP does not match certificate's
  altnames" error.
- This does not touch or migrate main `bequesta.ca` DNS — only the one
  `url3059` CNAME record changes.
- No Cloudflare, Hetzner, or other infrastructure required — Vercel handles
  both hosting of the proxy and SSL issuance.
