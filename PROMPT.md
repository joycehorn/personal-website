# Build brief: personal website for Joyce Horn Fonteles

You are building my personal academic website. Read this whole file **and** `content.yaml` (same folder) before writing any code.

---

## 0. How to work with me

1. **First reply = a plan only.** Give me the file tree, the list of components, how the timeline will render on desktop vs. mobile, and any questions. Then wait for my OK.
2. **Build in the phases in §8.** Stop after each phase and tell me how to preview it.
3. **Never invent content.** Every name, date, title, number, and sentence comes from `content.yaml`. If a value is `"TODO"` or missing, render nothing (no placeholder, no lorem ipsum, no plausible-sounding filler) and leave an HTML comment `<!-- TODO: field -->`.
4. Items with `hidden: true` are never rendered.
5. Don't rewrite my copy. If you think a sentence should change, tell me; don't change it silently.
6. Prefer fewer dependencies over clever ones. Ask before adding any npm package not listed in §6.

---

## 1. Who this is for

I'm a Computer Science PhD candidate at Vanderbilt (defending spring 2027) working on multimodal AI, human-in-the-loop analysis, LLM evaluation, and explainable interfaces for education. Before the PhD I spent ~15 years in industry (software architecture, team lead for court systems, databases, training).

**Primary reader:** a hiring committee for a postdoc in AI for education / learning analytics. Think: researchers who work with large annotated dialogue and interaction datasets, who care about whether AI explanations are trustworthy to teachers, and who need someone who can work alongside an engineering team. They will spend 60–90 seconds. In that time they must get: what I research, that I publish, that I can build real systems, and and how to contact me.

**Secondary readers:** collaborators, students, industry recruiters, and Brazilian colleagues (hence Portuguese).

**Positioning rules:**
- Academic identity first; industry is clearly present and framed as a strength, never hidden and never a separate "other jobs" afterthought.
- Do **not** name any specific institution, lab, or job I'm applying to anywhere on the site.

---

## 2. The core concept: "an annotated timeline"

My own research tool is an **AI-enhanced timeline** that lays several data streams (gaze, speech, movement, AI labels) side by side on parallel tracks so a researcher can scrub through a session and see what was happening across all of them at once. Each moment carries **annotation labels** from a codebook.

**The site applies that same idea to my career.** This is the signature element and the reason the site won't look like a template.

- Every dated item (research, education, industry, publications, honors, service) lives on **one shared timeline with parallel lanes**, instead of six separate sections like most academic sites.
- A **playhead** lets the visitor scrub through years. A panel below shows "At this point" (`ui.at_this_point`): everything active in that year across all lanes. This is what makes the dual career legible. For example, 2014–2017 shows the master's, a Solutions Architect job, and the first publications at the same time.
- Every item carries small **annotation chips** (its `tags`), styled like codebook labels: monospace, uppercase, hairline border.
- The conventional sections (Education, Experience, Fellowships, Service) still exist as **filtered views of the same data** (lane toggles + a "Read as a list" mode), so a scanning recruiter can find them instantly.

The rest of the site should feel like the documentation around a careful research instrument: precise, quiet, well-typeset, with one confident interactive centerpiece.

---

## 3. Information architecture

Routes exist for both languages: `/` (English) and `/pt/` (Portuguese), with matching subpaths.

### Home (`/`)
1. **Header**: name (wordmark, not a logo), nav (`ui.nav_*`), language switch (`ui.switch_lang`), theme toggle.
2. **Hero**: name set large; `headline`; `now` line in small mono; one action: email (`meta.email`), plus small links to Scholar / LinkedIn / GitHub / ORCID (skip TODO ones). **No CV or PDF downloads anywhere on the site.** Directly below, a **mini timeline strip**: all lanes compressed into a ~40px tall band spanning 2002 → 2027, purely visual, linking to `#timeline`. This strip is the hero's only "graphic".
3. **About**: `about` text in a ~65ch column. Optional portrait (`meta.portrait`) placed beside it, rectangular, modest size, not circle-cropped. If the file doesn't exist, render no image and no empty box.
4. **Research**: the four `research_themes` **in the order given**, each with its chip, title, and text. Layout: a 2×2 grid on desktop with hairline dividers, not cards with shadows.
5. **Selected projects**: projects with `featured: true`. Each shows period, title, context, role (if any), summary, chips, and its related publications as compact links (`ui.related_pubs`). Then a single quieter row for non-featured projects (the music-visualization work).
6. **Timeline** (`#timeline`): the centerpiece described in §4.
7. **From production systems to research**: the `bridge` block. Place it right after the timeline, visually tied to the Industry lane color.
8. **Footer**: contact, links (`meta.links`, skip TODO ones), last-updated date (build time), language switch again.

### Publications (`/publications`)
- Grouped by year, newest first. "Under review" items in their own group at the top, clearly labelled (`ui.under_review`), never mixed in as if published.
- Filters: type (`journal` / `conference` / `workshop` / `under_review`), a "First-author only" toggle (`first_author: true`), and tag chips. Show a live count.
- Each entry: title (never translated), authors with **`Fonteles, J.H.`** in bold, venue, year, DOI link (`https://doi.org/<doi>`) or `url`, award badge if `award` exists, chips.
- "Copy citation" button (`ui.copy_citation` → `ui.copied`) that copies an APA-style string built from the fields.
- Featured publications (`featured: true`) get a small marker but stay in chronological order.

### 404
Bilingual, using `ui.not_found_title` / `ui.not_found_link`, with the mini timeline strip drawn with an empty playhead.

There is no separate projects page and no blog.

---

## 4. Timeline component (spec)

**Data:** all `timeline` items (except `hidden`) plus one point per `publications` entry (lane `publications`). Items have either `start`/`end` (range) or `date` (point). `end: "present"` = ongoing; `end_expected` = planned end.

**Desktop (≥ 900px): horizontal swimlanes**
- X axis: years 2002 → 2027, year ticks every year, labels every 5 years plus the current year.
- Lanes in the order of `lanes`, each with its label in the left gutter and its own color (see §5).
- Ranges: thin bars (6–8px) with rounded ends. Overlapping items in the same lane stack into sub-rows automatically. Ongoing items run to today's date. The `end_expected` segment (PhD → May 2027) is drawn **dotted**.
- Points: small dots; publications in the same year stack vertically and show a count on hover.
- **Playhead**: a 1px vertical line that follows the pointer over the chart, snaps to months, and shows the year/month in a mono label at the top. Clicking pins it. Default position: today.
- **"At this point" panel** below the chart: lists every item active at the playhead, grouped by lane, each with lane color, role, org, dates, chips. Clicking an item in the chart pins it and expands its full detail (summary, advisor, thesis, related publications) in the same panel. **No modals.**
- **Lane legend = toggle buttons** (`aria-pressed`). Toggling animates lanes in/out (≤ 200ms) and updates the panel.
- **Keyboard**: chart is focusable; ← / → move the playhead by one month, Shift+← / → by one year; Tab moves through items; Enter pins.

**Mobile (< 900px): vertical**
- Years run top to bottom; each item is a row with a colored lane marker on the left, dates in mono, role and org. Lane filter chips are sticky at the top.
- No playhead. Tapping a row expands its detail inline.

**List view** (`ui.list_view` / `ui.timeline_view` toggle, and the no-JS fallback): semantic HTML, one section per lane with `<h3>`, entries in reverse chronological order. This must exist in the server-rendered HTML so the content is crawlable and works without JavaScript; the interactive chart enhances it.

**Implementation:** SVG for the chart, DOM for the panel, vanilla TypeScript in a single island/component. No charting libraries; the scale math is simple. Must not cause layout shift on load.

---

## 5. Visual direction

**Mood:** a well-made research instrument + a printed academic monograph. Warm paper, black ink, a few precise accent colors, lots of air, hairline rules. Confident typography does the work that illustrations do on other sites.

**Typography** (self-host via `@fontsource`, subset to **latin + latin-ext** so ã, ç, õ, é render correctly):
- Display/headings: **Newsreader** (variable, optical sizes). Name in the hero at ~clamp(48px, 8vw, 104px), weight 400–500, tight tracking.
- Body: **IBM Plex Sans**, 17–18px, line-height 1.6.
- Labels, dates, chips, nav, numbers: **IBM Plex Mono**, 12–13px, uppercase for chips with +0.04em tracking.

**Color tokens** (CSS custom properties on `:root`, with a dark theme via `prefers-color-scheme` and a manual toggle stored in `localStorage` wrapped in try/catch):

| token | light | dark |
|---|---|---|
| `--paper` | `#F6F3EC` | `#14130F` |
| `--ink` | `#1B1A17` | `#ECE8DF` |
| `--muted` | `#6B675E` | `#9C978C` |
| `--rule` | `#DDD7CA` | `#2E2C26` |
| `--lane-research` | `#1F5E5B` | `#5FA8A2` |
| `--lane-education` | `#3B4A8C` | `#8B98D6` |
| `--lane-industry` | `#A4552C` | `#D98A5F` |
| `--lane-publications` | `#1B1A17` | `#ECE8DF` |
| `--lane-honors` | `#9A7A22` | `#D2B55E` |
| `--lane-service` | `#5E6B3A` | `#A5B47A` |

Accent colors appear **only** in the timeline, chips, and small markers. Never as large fills or backgrounds. Text contrast must meet WCAG AA in both themes.

**Layout:**
- Max content width ~1180px. A narrow left margin column holds small mono section labels (e.g. `About`, `Research`); the main column holds content at ~65ch. The timeline breaks out to full content width.
- Asymmetric, left-aligned. Sections separated by generous space (96–144px) and a single hairline rule.
- Generous but not cavernous on mobile (16px side gutters, no horizontal scroll anywhere).

**Motion:** minimal and purposeful: playhead movement, lane toggles, panel expansion, link underlines. Nothing animates on scroll. Respect `prefers-reduced-motion` (turn all of it off).

**Do not do any of these** (they're what make sites look templated):
- Gradient heroes, blurred blobs, glassmorphism, noise overlays, neon accents, purple-blue anything.
- "Hi, I'm Joyce 👋", typing animations, rotating job titles, emoji in headings.
- Skill bars, percentage rings, tech-logo walls, "years of experience" counters.
- Three identical icon cards in a row; drop-shadow cards everywhere; stock icons next to every item.
- Centered-everything layouts; full-screen hero with a scroll-down arrow.
- Section headings like "What I Do", "My Journey", "Let's Connect".
- Inter, Poppins, Montserrat, Roboto, or system-ui as the visible typeface.
- Scroll-jacking, parallax, carousels, sliders, fade-in-on-scroll.
- A vertical "timeline" with alternating left/right cards and a center line (the cliché version of what we're doing properly).
- Tailwind utility soup or a UI kit. Write intentional CSS with the tokens above.

**One optional personal touch (Phase 5 only, ask me first):** on the music-visualization project row, a tiny canvas (≤ 3 KB of JS) where a few particles drift toward the pointer like they're following a conductor's baton, a nod to my earliest research. Off under reduced motion, paused when offscreen.

---

## 6. Bilingual (EN / PT)

- Routes: English at `/`, Portuguese at `/pt/`, same structure (`/publications` ↔ `/pt/publicacoes`). `<html lang="en">` / `<html lang="pt-BR">`.
- `<link rel="alternate" hreflang="en|pt-BR|x-default">` on every page.
- Language switch goes to the **equivalent page**, preserving the hash (e.g. `#timeline`).
- Fields with `en` / `pt` are translations; pick by locale. **Plain strings are never translated**: paper titles, author lists, venues, DOIs, names of people, institutions written only once, tool names. (One paper title is in Portuguese originally; it stays as is on the English page too.)
- Dates are formatted per locale with `Intl.DateTimeFormat` (e.g. "Aug 2022" / "ago. 2022"). "present" / "expected" come from `ui`.
- No automatic redirect. On the English home, if `navigator.language` starts with `pt`, show a small dismissible line at the top with `ui.suggest_pt` linking to `/pt/`. Remember dismissal in `localStorage` (try/catch).
- Every visible UI string comes from `ui` in `content.yaml`. If you need one that isn't there, add it to `content.yaml` with both languages and tell me.

---

## 7. Tech stack and quality bar

**Site URL:** `https://joycehornfonteles.com` (set as Astro `site`; use it for canonical URLs, hreflang, sitemap, OG tags, and JSON-LD).

**Stack:** Astro (current stable), static output, TypeScript. Content loaded from `content.yaml` at build time (use `js-yaml` or Astro's content loader). Fonts via `@fontsource-variable/newsreader`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`. No React/Vue, no Tailwind, no UI kits, no analytics scripts.

**Suggested structure:**
```
/content.yaml
/public/portrait.jpg   (optional)
/src/lib/content.ts    (loads + types the YAML, locale helpers, date formatting)
/src/components/       (Header, Hero, MiniTimeline, About, Research, Projects, Timeline, Bridge, PubList, Chip, Footer)
/src/layouts/Base.astro
/src/pages/index.astro, publications.astro, 404.astro
/src/pages/pt/index.astro, publicacoes.astro
/src/styles/tokens.css, base.css
```

**Quality bar:**
- Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO (mobile).
- Semantic HTML, visible focus states, skip link, all interactive elements keyboard-operable, ARIA only where native elements can't do the job.
- No layout shift from fonts (use `font-display: swap` + size-adjusted fallbacks).
- SEO: unique `<title>`/description per page and locale; Open Graph + Twitter tags; a generated OG image (name + headline + mini timeline strip, static PNG at build time is fine); `schema.org/Person` JSON-LD with name, jobTitle, affiliation, alumniOf, sameAs (non-TODO links), knowsLanguage [en, pt]; `sitemap.xml`; `robots.txt`.
- **Print stylesheet**: printing the home page gives a clean, two-to-three-page CV-like document (hide nav, toggles, chart; show list view).
- Email is shown as a normal `mailto:` link. No phone number anywhere.
- Works in the last two versions of Chrome, Safari, Firefox, and on iOS Safari.

---

## 8. Build phases (stop after each)

1. **Foundation:** scaffold, content loader + types, tokens, fonts, base layout, header/footer, EN/PT routing, language switch, theme toggle. Show me the empty shell in both languages and both themes.
2. **Home content:** hero (without mini strip yet), about, research themes, projects, bridge block.
3. **Timeline:** list view first (server-rendered), then the desktop swimlane chart with playhead and panel, then mobile layout, then keyboard support. Then the hero mini strip, reusing the same scale code.
4. **Publications page:** grouping, filters, counts, copy citation.
5. **Polish:** 404, print CSS, SEO/OG/JSON-LD, sitemap, reduced-motion pass, accessibility pass, Lighthouse run. Ask me about the optional particle touch.
6. **Deploy notes:** short `DEPLOY.md` for deploying the static build to Cloudflare Pages (or Netlify) from a GitHub repo, and the exact DNS records to set at GoDaddy to point `joycehornfonteles.com` (apex) and `www.joycehornfonteles.com` at it, with HTTPS and `www` redirecting to the apex. Also explain how to set up free email forwarding so `joyce@joycehornfonteles.com` reaches my Gmail (e.g. Cloudflare Email Routing), without breaking the website DNS.

---

## 9. Acceptance checklist (verify before saying a phase is done)

- [ ] Every rendered fact traces to `content.yaml`; nothing invented; `hidden` items absent; TODO fields render nothing.
- [ ] Both `/` and `/pt/` render every section; switching language keeps the page and hash.
- [ ] Paper titles, authors, and venues are identical on both language versions.
- [ ] `Fonteles, J.H.` is bold in every author list.
- [ ] Timeline: dual-career overlap is visible (e.g. 2014–2017 shows Education, Research, Industry together); PhD's expected segment is dotted; lane toggles work; keyboard works; mobile layout has no horizontal scroll.
- [ ] Page works with JavaScript disabled (list view shows everything).
- [ ] Under-review papers are clearly separated from published ones.
- [ ] Light and dark themes both pass AA contrast; reduced motion disables all animation.
- [ ] Portuguese accents render in all three typefaces.
- [ ] None of the items in the "Do not do" list appear.
- [ ] Lighthouse ≥ 95 in all four categories on mobile.
