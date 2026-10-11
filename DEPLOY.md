# Deployment & Domain Guide

This document contains step-by-step instructions to deploy your website from GitHub, configure DNS records at GoDaddy for both domains (`joycehornfonteles.com` and `hornfonteles.com`), set up automatic HTTPS with `www` redirecting to the apex, and configure free email forwarding so `joyce@hornfonteles.com` (and `joyce@joycehornfonteles.com`) reach your personal Gmail.

---

## 1. Hosting Architecture Overview

| Property | Value |
|---|---|
| **Primary Website Domain** | `https://joycehornfonteles.com` |
| **Secondary Domain (Redirect & Email)** | `hornfonteles.com` |
| **Contact Email** | `joyce@hornfonteles.com` |
| **Hosting Options** | **GitHub Pages** (Built into your repo, zero cost) OR **Cloudflare Pages** (Free, includes email routing) |
| **Domain Registrar** | **GoDaddy** |

---

## 2. Option A: Deploying to GitHub Pages (`github.io`)

Because this website is a modern, 100% static Astro site, **GitHub Pages supports it natively**. 

A ready-to-use GitHub Actions workflow is already created in `.github/workflows/deploy.yml`.

### Step 2.1: Push Code to GitHub
1. Create a repository on GitHub (e.g. `joyce-academic-site` or `<your-username>.github.io`).
2. Push your project to GitHub:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2.2: Enable GitHub Pages in Repository Settings
1. On GitHub, go to your repository → **Settings** → **Pages** (in the left sidebar under "Code and automation").
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every time you push to `main`, GitHub Actions will automatically:
   - Run Node 22
   - Build the site (`npm run build`)
   - Deploy the static assets to GitHub Pages.

### Step 2.3: Set Custom Domain in GitHub Pages
1. Under **Custom domain**, enter: `joycehornfonteles.com`.
2. Click **Save**.
   *(GitHub creates a `CNAME` record in the deployment and starts DNS verification).*
3. Once DNS resolves (see GoDaddy steps below), check **Enforce HTTPS** (GitHub will provision a free Let's Encrypt SSL certificate automatically).

### Step 2.4: GoDaddy DNS Records for GitHub Pages

In your GoDaddy DNS management for **`joycehornfonteles.com`**:

#### A. Apex Root Records (Points `joycehornfonteles.com` to GitHub's Anycast IP addresses):
Add four **A** records with Name `@`:

| Type | Name | Value / Points to | TTL |
|---|---|---|---|
| **A** | `@` | `185.199.108.153` | 1 Hour |
| **A** | `@` | `185.199.109.153` | 1 Hour |
| **A** | `@` | `185.199.110.153` | 1 Hour |
| **A** | `@` | `185.199.111.153` | 1 Hour |

#### B. Subdomain Record (Points `www.joycehornfonteles.com` to your GitHub Pages domain):
Add one **CNAME** record:

| Type | Name | Value / Points to | TTL |
|---|---|---|---|
| **CNAME** | `www` | `<YOUR-GITHUB-USERNAME>.github.io` | 1 Hour |

> [!NOTE]
> GitHub Pages automatically redirects `www.joycehornfonteles.com` to `https://joycehornfonteles.com` when you set `joycehornfonteles.com` as the custom domain.

---

## 3. Option B: Deploying to Cloudflare Pages

If you prefer Cloudflare Pages:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select your repository and set:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION: 22`
3. Click **Save and Deploy**.
4. In **Custom domains**, add `joycehornfonteles.com` and `www.joycehornfonteles.com`.

---

## 4. Free Email Forwarding (`joyce@hornfonteles.com` → Gmail)

GitHub Pages hosts websites, but does not provide email routing. You can route emails for free using **Cloudflare Email Routing** or **ImprovMX / Forward Email**.

The cleanest setup (even when hosting the website on GitHub Pages) is using **Cloudflare for DNS & Email Routing**:
- GoDaddy remains your domain registrar.
- Cloudflare manages DNS (it points web traffic to GitHub Pages and handles email routing to Gmail).

### Setting up Free Cloudflare Email Routing:
1. In Cloudflare, add your domains (`hornfonteles.com` and `joycehornfonteles.com`) on the **Free** plan.
2. In the GoDaddy dashboard, update nameservers to Cloudflare's two nameservers.
3. In Cloudflare for **`hornfonteles.com`**:
   - Go to **Email** → **Email Routing**.
   - Under **Destination addresses**, add your personal Gmail address and click the verification link sent to your inbox.
   - Under **Routing rules**, create custom address: `joyce` @ `hornfonteles.com` → Action: `Send to` → Destination: `yourname@gmail.com`.
   - Click **Add records automatically**. Cloudflare adds the necessary MX and SPF records:
     - `MX @ isaac.mx.cloudflare.net (Priority 13)`
     - `MX @ linda.mx.cloudflare.net (Priority 55)`
     - `MX @ amir.mx.cloudflare.net (Priority 74)`
     - `TXT @ v=spf1 include:_spf.mx.cloudflare.net ~all`
4. In Cloudflare for **`joycehornfonteles.com`**:
   - Web traffic: Add a CNAME pointing to `<YOUR-USERNAME>.github.io`.
   - Email traffic: You can optionally add `joyce@joycehornfonteles.com` forwarding to your Gmail as well!

> [!IMPORTANT]
> **MX** and **TXT (SPF)** records for email operate completely independently from web **A** and **CNAME** records. Your email and your GitHub Pages website will run smoothly side by side with zero conflicts.

---

## 5. Redirecting `hornfonteles.com` to `joycehornfonteles.com`

Since you own both domains, you want visitors who type `hornfonteles.com` to land on `https://joycehornfonteles.com`:

### If using Cloudflare DNS:
- Go to `hornfonteles.com` → **Rules** → **Redirect Rules** → **Create rule**:
  - Name: `Redirect hornfonteles.com to joycehornfonteles.com`
  - Field: `Hostname` equals `hornfonteles.com`
  - Target: `Dynamic` → `concat("https://joycehornfonteles.com", http.request.uri.path)`
  - Status: `301 (Moved Permanently)`

### If using GoDaddy DNS:
- In GoDaddy for `hornfonteles.com`, go to **Domain Settings** → **Forwarding** → **Add Forwarding**:
  - Forward to: `https://joycehornfonteles.com`
  - Redirect type: **301 (Permanent)**

---

## 6. How to Send Emails as `joyce@hornfonteles.com` from Gmail

To reply to or compose emails as `joyce@hornfonteles.com` from inside Gmail:
1. Create a free account at [Resend](https://resend.com) (3,000 free emails/month) or [Brevo](https://brevo.com) (300 free emails/day).
2. Add and verify `hornfonteles.com` for sending.
3. In Gmail:
   - Go to **Settings** → **Accounts and Import** → **Send mail as** → **Add another email address**.
   - Name: `Joyce Horn Fonteles`
   - Email: `joyce@hornfonteles.com`
   - Enter the SMTP server host, port `587`, username, and API key.
   - Enter the confirmation code sent to your inbox.
4. Now you can select `joyce@hornfonteles.com` directly in Gmail's "From" field.

---

## 7. Pre-Launch Verification Checklist

- [ ] Repository pushed to GitHub with `.github/workflows/deploy.yml` passing.
- [ ] GitHub Pages custom domain set to `joycehornfonteles.com` with **Enforce HTTPS** checked.
- [ ] GoDaddy DNS has the 4 GitHub `A` records and `www` CNAME.
- [ ] `https://joycehornfonteles.com` loads over secure HTTPS.
- [ ] `www.joycehornfonteles.com` redirects to `https://joycehornfonteles.com`.
- [ ] Test email sent to `joyce@hornfonteles.com` lands in your personal Gmail.
- [ ] Language switch works between English (`/`, `/publications`) and Portuguese (`/pt/`, `/pt/publicacoes`).
