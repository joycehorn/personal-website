# Round 2: fixes and content update

Read this whole file, then make all changes below. `content.yaml` has been replaced with an updated version. Re-read it; don't rely on the old one. As before: never invent content, keep the design rules in PROMPT.md §5, and commit at the end with a clear message.

## A. Content (from the new content.yaml)
1. **New/changed fields** to support:
   - `projects[].period` is now bilingual (`en`/`pt`). Render by locale.
   - `publications[].status` (optional, bilingual), e.g. "Major revision", "Submitted", "Under review". When present, show it as the status label instead of "Under review" text and instead of using `venue` as a status.
   - New publication `type: preprint` (label from `ui.preprint`). Add it to the publications filters.
   - New tags `VALIDITY` and `AFFECT`. Use them like the other tags.
   - `meta.links.scholar` and `meta.links.github` are now real URLs. Show them in the hero and footer next to LinkedIn.
2. **Research themes** were rewritten (4 themes, new order). Render them as before (2×2 grid).
3. **Publications page grouping:** put `under_review` and `preprint` items in the top group ("In review"/"Em avaliação"), each showing venue + status (e.g. "British Journal of Educational Technology · Major revision"). Everything else is grouped by year as now.
4. **Related-publication links** on project cards: label = short venue + year with no duplication ("ICCE 2024", not "ICCE 2024 (2024)"). For items with `status`, use "short venue · status" (e.g. "BJET · Major revision", "LAK 2027 · Submitted"). Never show a bare "Under review (2026)".
5. Items still marked `# TODO` or `# VERIFY` in content.yaml: render them as they are, and list them for me at the end.

## B. Theme
6. **Default to the light theme on first visit regardless of `prefers-color-scheme`.** Keep the manual toggle and the saved preference.
7. **Warmer dark theme:** `--paper: #1E1B16; --rule: #3A352C; --muted: #A39D90;`. Keep the other dark tokens and re-check AA contrast for lane colors and muted text on the new background.

## C. Layout
8. **Hero:** the mini timeline strip must span the full content width (same width as the Research grid), not ~530px. Keep the name, headline, now-line, and contact row left-aligned above it.
9. **About:** show `public/portrait.jpg` (already added, 1200×1500, 4:5) to the right of the text column on desktop. Use a rectangle with no circle crop and no border radius larger than 2px. It should be about 280–320px wide, aligned to the top of the first paragraph, with `alt` = "Joyce Horn Fonteles" and `loading="eager"`. Include width/height attributes so there's no layout shift. On mobile, put it above the text at about 60% width. Generate a WebP version at build time if Astro's image pipeline is already set up; otherwise use the JPG as is.
10. Remove the **empty bordered box** next to the music-visualization project (the unfilled particle-canvas slot). Don't implement the canvas.

## D. Timeline bugs
11. **Off-by-one month:** the playhead defaults to "Nov 2026" when it is October 2026. Fix the month calculation (likely `getMonth()` being 0-based) and make sure "today" is computed in the browser at runtime, not frozen at build time.
12. **Ongoing items disappear from "At this point":** items with `end: "present"` must count as active at any date ≥ their start, including today. At today's date, the panel must include the PhD, the Vanderbilt research assistantship, the reviewing and mentoring items, etc.
13. **Axis range:** extend the X axis to at least **Dec 2027** so the dotted `end_expected` segment of the PhD (to May 2027) is visible. Fix the overlapping "2025"/"2026" labels at the right edge: label every 5 years plus the current year, and skip any 5-year label that would collide with the current-year label.
14. In the "At this point" panel, every entry shows its lane color marker, dates (mono), title, and org in one consistent type style. Right now publications and the CVPR item use different font sizes.
15. The lane label "Service & mentoring" touches the chart area. Give the gutter enough width or wrap the label.

## E. Other bugs
16. The label next to "From production systems to research" reads **"INDUSTRY / PESQUISA"** on both language versions. Use `lanes[industry]` + `lanes[research]` for the current locale ("Industry / Research" vs "Indústria / Pesquisa").
17. Stray **list bullets ("•")** appear before group headings on the publications page ("• Under review", "• 2026") and before "Publications" in the mobile timeline list. Remove them (`list-style: none` or don't put headings inside list items).
18. **Mobile timeline length:** the phone home page is ~18,800px tall because the list shows every item. On < 900px, show each lane collapsed to its 3 most recent items with a "Show all (n)" button (`aria-expanded`). Keep the full list in the HTML for no-JS and print.

## F. Verify before reporting back
- Take screenshots at 1280px and 375px wide, in light and dark, EN and PT: home and publications (16 total). Check them against everything above.
- Confirm "At this point" at today's date lists the ongoing items, and that the PhD's dotted segment is visible.
- `npm run build` passes with no console errors. Commit.
