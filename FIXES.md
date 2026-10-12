# Round 2: structure, content, and fixes

This replaces any earlier FIXES.md. Read all of it plus the updated `content.yaml` (re-read it; several fields changed). Never invent content, and keep the design rules in PROMPT.md §5 unless this file overrides them. Commit when done.

## 1. New home page structure
The current page repeats itself: research is described in About, Research, Selected projects, and the timeline, and industry is described in About, the timeline, and the "From production systems to research" block. The new order:

1. **Intro** (merges Hero + About)
2. **Research** (merges Research themes + Selected projects)
3. **Timeline** (unchanged concept)
4. **Footer / contact**

Remove the separate About section, the separate "Selected projects" section, and the Bridge block ("From production systems to research"). `bridge` is still in content.yaml but is no longer rendered. Update the nav: Research · Timeline · Publications (no "About"; the logo goes home).

### 1.1 Intro section
- **Two-column on desktop (≥ 900px):** left column holds the text; right column holds `public/portrait.jpg` (1200×1500, 4:5), about 300px wide, rectangle with ≤ 2px radius, top-aligned with the name. On mobile, the photo sits above the name at about 50% width.
- **Name size:** far smaller than now. `clamp(2.25rem, 4.2vw, 3.5rem)` (≈36–56px), weight 400, Newsreader. It must feel like the top of a type scale that continues down the page, not a poster.
- **Order in the left column:**
  1. Name (h1)
  2. `headline` (≈1.25rem, Plex Sans)
  3. `now`: the range line ("AI researcher · software architect · database lead · product owner · educator"), in mono, small caps or uppercase at 12–13px, with each role separated by a middle dot. This replaces the old "PhD candidate… Open to postdoctoral positions" line.
  4. `affiliation` in muted mono, 12px
  5. The three `about` paragraphs at normal body size, max ~62ch
  6. Contact row: email · Google Scholar · GitHub · LinkedIn (all from `meta.links`)
- **Below both columns:** the mini timeline strip at **full content width**, linking to `#timeline`.

### 1.2 Type scale (apply site-wide)
Use one scale everywhere. Body is 17–18px, h1 (name) as above, section titles (h2) ≈ 1.75rem Newsreader, item titles (h3) ≈ 1.25rem Newsreader, and labels, dates, and chips 12–13px Plex Mono. Section labels in the left margin stay as they are.

### 1.3 Research section
- Keep the 2×2 grid of the four `research_themes` (new content, new order).
- **Inside each theme card**, under the theme text, list:
  - the projects whose `theme` equals that theme's `id` (title + period, one line each, with the project summary revealed on click/expand, not shown by default), then
  - up to 2 key papers: publications carrying the theme's `tag`, preferring `featured`/`first_author`, newest first, shown as "Short venue Year" links (or "Short venue · status" for papers in review).
- Projects with `theme: earlier` (the music visualization work) appear once, below the grid, as a single quiet line: "Earlier work: Conducting particles: gesture-driven music visualization (2008–2021) →" which expands to its summary and publications.

## 2. Logo
Add the files I'm providing to `public/`:
- `jhf-mark-light.svg` / `jhf-mark-dark.svg`: isometric block letters "JHF", no outlines, for the header.
- `jhf-logo-light.svg` / `jhf-logo-dark.svg` / `jhf-logo-yellow.svg`: outlined versions for larger uses (404 page, OG image).

**Header:** replace the text wordmark with the mark (height 28–32px), inline the SVG or swap by theme so it matches light/dark, and keep the visible name next to it on desktop ("Joyce Horn Fonteles" in Newsreader at about 1rem). On mobile, show the mark only. The link has `aria-label` = "Joyce Horn Fonteles, home".
**Favicon:** generate `favicon.svg` from `jhf-mark-light.svg` (keep the existing favicon setup, just swap the file).
**OG image:** put `jhf-logo-light.svg` at the left of the generated OG image.

## 3. Content model changes (content.yaml)
- `now` is now the range line; new `affiliation` field (both bilingual).
- `projects[].period` is bilingual; `projects[].theme` maps projects to themes.
- `publications[].status` (optional, bilingual), e.g. "Major revision", "Submitted", "Under review". When present, show it instead of a year-based status.
- New publication `type: preprint` (`ui.preprint`). Add it to the publications filters.
- New tags `VALIDITY` and `AFFECT`.
- `meta.links.scholar` / `github` are now real. Show them in the intro and footer.
- **Publications page:** the top group "In review / Em avaliação" holds `under_review` + `preprint` items, each showing "Venue · status". The rest are grouped by year.
- Related-paper labels: "ICCE 2024", not "ICCE 2024 (2024)". Never show a bare "Under review (2026)".

## 4. Theme
- **Light theme by default on first visit**, regardless of `prefers-color-scheme`. Keep the toggle and the saved preference.
- **Warmer dark theme:** `--paper: #1E1B16; --rule: #3A352C; --muted: #A39D90;`. Re-check AA contrast.

## 5. Timeline bugs
1. **Off-by-one month:** the playhead says "Nov 2026" in October 2026. Fix the 0-based month bug, and compute "today" in the browser at runtime.
2. **Ongoing items** (`end: "present"`) must be active at any date ≥ start, including today, so "At this point" today lists the PhD, the research assistantship, reviewing, mentoring, etc.
3. **Axis to at least Dec 2027**, so the dotted `end_expected` PhD segment shows. Fix the overlapping "2025"/"2026" labels: label every 5 years plus the current year, and skip a 5-year label that would collide.
4. In "At this point", every entry uses the same style: lane color marker, dates (mono), title, org.
5. The "Service & mentoring" lane label touches the chart. Widen the gutter or wrap it.
6. **Mobile (< 900px):** each lane shows its 3 most recent items with a "Show all (n)" button (`aria-expanded`). Keep the full list in the HTML for no-JS and print.

## 6. Other bugs
- Remove the empty bordered box next to the music project (the unbuilt particle canvas). Don't build the canvas.
- Remove the stray list bullets ("•") before group headings on the publications page and in the mobile timeline.
- Any remaining English text on `/pt/` pages, or Portuguese text on English pages, is a bug. Every string must come from content.yaml for the current locale.

## 7. Verify before reporting back
Screenshots at 1280px and 375px wide, light and dark, EN and PT, for the home and publications pages (16 total). Check them against this file, especially: the name size relative to the body, no empty right half in the intro, the logo in both themes, "At this point" listing ongoing items today, and the dotted PhD segment visible. `npm run build` passes with no console errors. Commit and summarize what changed.
