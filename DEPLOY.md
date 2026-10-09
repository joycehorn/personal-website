# Deployment & Domain Guide

This document contains step-by-step instructions to deploy the website from your GitHub repository, configure DNS records at GoDaddy for both domains (`joycehornfonteles.com` and `hornfonteles.com`), set up automatic HTTPS with `www` redirecting to the apex, and configure free email forwarding so `joyce@hornfonteles.com` (and `joyce@joycehornfonteles.com`) seamlessly reach your personal Gmail.

---

## 1. Hosting Architecture Overview

| Property | Value |
|---|---|
| **Primary Website Domain** | `https://joycehornfonteles.com` |
| **Secondary Domain (Redirect & Email)** | `hornfonteles.com` |
| **Contact Email** | `joyce@hornfonteles.com` |
| **Recommended Host** | **Cloudflare Pages** (Free, global CDN, native Node 22 support, free Email Routing, 1-click apex flattening) |
| **Alternative Host** | **Netlify** |
| **Domain Registrar** | **GoDaddy** |

---

## 2. Deploying to Cloudflare Pages (Recommended)

### Step 2.1: Push Code to GitHub
1. Create a private or public repository on GitHub (e.g. `joyce-academic-site`).
2. In your local terminal, add the remote and push `main`:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/joyce-academic-site.git
   git branch -M main
   git push -u origin main
   ```

### Step 2.2: Connect Cloudflare Pages
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click **Workers & Pages** → **Create application** → select the **Pages** tab → **Connect to Git**.
3. Authorize GitHub and select your repository.
4. Configure the build settings:
   - **Project name:** `joycehornfonteles`
   - **Production branch:** `main`
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Under **Environment variables**, ensure Node 22 is used:
   - Variable name: `NODE_VERSION`
   - Value: `22`
6. Click **Save and Deploy**. Cloudflare will build the site in ~30 seconds and provide a `*.pages.dev` preview URL.

---

## 3. GoDaddy DNS Configuration

You own two domains at GoDaddy:
1. `joycehornfonteles.com` (Main Website)
2. `hornfonteles.com` (Email & Alias Redirect)

There are two approaches:
- **Method A (Recommended): Delegate Nameservers to Cloudflare** — GoDaddy remains your domain registrar, but Cloudflare manages the DNS. This gives you 100% automated SSL certificates, zero-config apex CNAME flattening, free email routing, and instant rule execution.
- **Method B: Keep GoDaddy Nameservers and set manual DNS records**.

---

### Method A: Cloudflare DNS (Simplest & Most Reliable)

1. In Cloudflare, click **Add a site** → enter `joycehornfonteles.com` → choose the **Free** plan.
2. Repeat for `hornfonteles.com`.
3. Cloudflare will scan existing records and provide two nameservers (e.g., `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`).
4. Log into [GoDaddy Domain Portfolio](https://dcc.godaddy.com/control/portfolio):
   - Click **`joycehornfonteles.com`** → **DNS** → **Nameservers** → **Change Nameservers**.
   - Select **I'll use my own nameservers** and paste Cloudflare's two nameservers.
   - Repeat for **`hornfonteles.com`**.
5. Back in Cloudflare Pages:
   - Go to your Pages project → **Custom domains** → **Set up a domain**.
   - Enter `joycehornfonteles.com` → Click **Activate domain**.
   - Enter `www.joycehornfonteles.com` → Click **Activate domain**.
   Cloudflare automatically handles apex flattening, creates DNS records, provisions SSL certificates, and handles `www` redirection.

---

### Method B: Keeping GoDaddy Nameservers (Manual Records)

If you prefer to keep GoDaddy's default nameservers:

#### 1. Records for `joycehornfonteles.com` in GoDaddy DNS:

| Type | Name / Host | Value / Points to | TTL | Purpose |
|---|---|---|---|---|
| **CNAME** | `www` | `<your-project>.pages.dev` | 1 Hour / Auto | Points `www` to Cloudflare Pages |
| **A** | `@` | (Cloudflare Pages IP or GoDaddy Forwarding) | 1 Hour | See forwarding below |

> [!IMPORTANT]
> Because standard DNS specifications do not allow a CNAME record at the apex root (`@`), and GoDaddy DNS does not support native ANAME/ALIAS flattening, the standard GoDaddy method is:
> 1. Set the **CNAME** for `www` to `<your-project>.pages.dev`.
> 2. In GoDaddy's **Domain Settings** for `joycehornfonteles.com`, scroll to **Forwarding** → **Add Forwarding**:
>    - Forward `@` to `https://www.joycehornfonteles.com`
>    - Redirect type: **301 (Permanent)**
>    - Forward with masking: **No (Forward only)**
>
> *(Note: Using Method A with Cloudflare nameservers avoids this workaround entirely and serves the website directly at the clean apex `https://joycehornfonteles.com`)*.

---

## 4. Redirecting `www` to Apex (and Secondary Domain)

To ensure visitors who type `www.joycehornfonteles.com` or `hornfonteles.com` cleanly land on `https://joycehornfonteles.com`:

### In Cloudflare (Workers & Pages or Redirect Rules):
1. In Cloudflare Dashboard, select `joycehornfonteles.com` → **Rules** → **Redirect Rules** → **Create rule**.
2. **Rule name:** `Redirect WWW to Apex`
3. When incoming requests match:
   - Field: `Hostname`
   - Operator: `equals`
   - Value: `www.joycehornfonteles.com`
4. Then redirect to:
   - Type: `Dynamic`
   - Expression: `concat("https://joycehornfonteles.com", http.request.uri.path)`
   - Status code: `301 (Moved Permanently)`
5. For `hornfonteles.com`: Create a similar redirect rule forwarding all traffic to `https://joycehornfonteles.com`.

---

## 5. Free Email Forwarding Setup (`joyce@hornfonteles.com` → Gmail)

You can forward all emails sent to `joyce@hornfonteles.com` (and `joyce@joycehornfonteles.com`) directly to your personal Gmail inbox completely free using **Cloudflare Email Routing**.

> [!NOTE]
> Email DNS records (**MX** and **TXT/SPF**) are entirely separate from website records (**A** and **CNAME**). Setting up email routing will **never** interfere with or break website traffic.

### Step-by-Step Email Routing Setup:

1. In the Cloudflare Dashboard, select **`hornfonteles.com`**.
2. In the left sidebar, click **Email** → **Email Routing**.
3. Under **Destination addresses**, click **Add destination address**:
   - Enter your personal Gmail address (e.g. `yourname@gmail.com`).
   - Cloudflare will send a verification link to your Gmail. Open Gmail and click **Verify email address**.
4. Under **Routing rules**, click **Create address**:
   - Custom address: `joyce` @ `hornfonteles.com`
   - Action: `Send to`
   - Destination: `yourname@gmail.com`
   - Click **Save**.
5. Enable Email Routing: Cloudflare will ask to add the required DNS records. Click **Add records automatically**.

### The Exact DNS Records Cloudflare Adds for Email:

If adding manually, these are the DNS records for `hornfonteles.com`:

| Type | Name | Content / Value | Priority | Purpose |
|---|---|---|---|---|
| **MX** | `@` | `isaac.mx.cloudflare.net` | 13 | Cloudflare Mail Ingestion |
| **MX** | `@` | `linda.mx.cloudflare.net` | 55 | Cloudflare Mail Ingestion (Backup) |
| **MX** | `@` | `amir.mx.cloudflare.net` | 74 | Cloudflare Mail Ingestion (Backup) |
| **TXT** | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | — | SPF validation (prevents spam flags) |
| **TXT** | `_cf-custom-hostname` | `<cloudflare-verification-code>` | — | Cloudflare domain verification |

*(Optional: You can repeat this process for `joycehornfonteles.com` so any email sent to `joyce@joycehornfonteles.com` also forwards to your Gmail!)*

---

## 6. How to Send Emails as `joyce@hornfonteles.com` from Gmail (Optional)

By default, Cloudflare Email Routing handles *incoming* mail. If you want to *reply* or *compose* emails from inside Gmail so recipients see `From: joyce@hornfonteles.com`:

1. Sign up for a free transactional SMTP service such as **Resend** ([resend.com](https://resend.com), 3,000 free emails/month) or **Brevo** (300 free emails/day).
2. Add `hornfonteles.com` in your SMTP provider and verify DKIM.
3. In Gmail:
   - Go to **Settings** (gear icon) → **See all settings** → **Accounts and Import**.
   - Under **Send mail as**, click **Add another email address**.
   - Name: `Joyce Horn Fonteles`
   - Email address: `joyce@hornfonteles.com`
   - Uncheck "Treat as an alias".
   - Enter the SMTP server, port `587`, username, and API key/password from your provider.
   - Verify the confirmation code sent to your inbox.
4. Now, when writing an email in Gmail, you can select `joyce@hornfonteles.com` in the **From** dropdown!

---

## 7. Pre-Launch Verification Checklist

Before announcing the site, verify:
- [ ] `https://joycehornfonteles.com` loads over secure HTTPS (padlock icon).
- [ ] `http://joycehornfonteles.com` redirects automatically to `https://`.
- [ ] `www.joycehornfonteles.com` redirects to `https://joycehornfonteles.com`.
- [ ] Send a test email from an external address to `joyce@hornfonteles.com` and verify it lands in your Gmail within seconds.
- [ ] Language switch links correctly between `/` ↔ `/pt/` and `/publications` ↔ `/pt/publicacoes`.
- [ ] Test Open Graph preview with [OpenGraph.xyz](https://www.opengraph.xyz/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator) to confirm the dynamic `og.png` displays.
