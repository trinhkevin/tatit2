# Monolith-style Redesign — Design Spec
**Date:** 2026-10-07
**Reference:** https://monolithstudio.com/artists/oscar-akermo (plus their home, book-experience, aftercare and design.monolithstudio.com pages)
**Brief (from Kevin):** copy the reference aesthetic and movement wholesale, use the content we already have, omit sections we have no congruent content for while keeping the aesthetic.

---

## 1. What the reference is made of

Observed by fetching the page, its Webflow stylesheet and inline scripts, and scroll-capturing it at 1440px and 390px.

- **Canvas:** flat light grey page `#e0e0e0`, near-black ink `#010101`, off-white `#f1f1f1` on black. Hairlines are `rgba(1,1,1,.25)` / `.2`. No shadows, no rounded cards (3px radius on inputs only).
- **Type:** SK Modernist (300/400/700). Everything scales with the viewport (body `font-size: 1vw`, sizes in `em`). Display type is uppercase, `letter-spacing: -.05em`, `line-height: .75`. Labels are tiny uppercase bold (`.7–.8em`) at 55% opacity. Links hover to `opacity: .65` over `.4s`.
- **Header:** fixed, two-line logotype left (name + time/location with a blinking dot), a 3-column link grid right, "book experience ↗" as the CTA. `mix-blend-mode: difference` + `filter: invert()` so it inverts over photos. On mobile: "MENU" + two-line hamburger opening a full-screen `#bdbdbd` panel that slides in from the right with huge uppercase links, a bordered "book experience ↗" row and follow/reach-out boxes.
- **Artist page flow:** 85vh hero (small profile photo, giant name, bottom row of label/value pairs) → full-bleed photo (62em) → about text → "Latest works" stage with click-to-switch thumbnails bottom-right → 2-up photo grid → pinned gallery (left photo sticky at 100vh, right column of photos translating up over a 400vh track) → news → media → FAQ → giant "BOOK | EXPERIENCE ↗" strip → map → black footer.
- **Fixed bottom bar:** grey, border-top, in-page anchors with dots (active one is black with white text), "book experience ↗" at the right. On mobile only the CTA remains, full width.
- **Motion:** Lenis smooth scroll (`duration 1.12`, exponential ease-out), `.4s` opacity hovers, crossfades on the works stage, the pinned gallery, blinking dot, Webflow scroll interactions on the big photo and the CTA arrow.
- **Available Designs page:** H1 + short uppercase blurb, filter row (ALL / AVAILABLE / CLAIMED with counts and dot indicators), 5-column grid of white cards with the design name + artist underneath.
- **Book page:** giant "BOOK / EXPERIENCE", a tab row (BOOK ● | CAREER ○) with border lines, form in the left half with boxed 3px-radius inputs, small labels, two fields per row.
- **Aftercare page:** giant lowercase-ish heading (`7em`, weight 400, line-height .8), intro paragraph bottom-left of the hero, then rows with the section title left and body right separated by hairlines.

## 2. Decisions

| Topic | Decision | Why |
|---|---|---|
| Font | **Switzer** (Fontshare, ITF Free Font License) weights 300/400/500/700, self-hosted woff2 as shipped (license forbids subsetting/conversion). | SK Modernist's web license is paid. Switzer is the closest free grotesk with a license that explicitly allows self-hosting on our own site. |
| Colour | Copy exactly: `--grey #e0e0e0`, `--black #010101`, `--white #f1f1f1`, menu panel `#bdbdbd`. | Wholesale copy. |
| Scale | Fluid type via `clamp()`/`vw` per element instead of `body{font-size:1vw}` + `em`. Same resulting sizes at 1440/768/390. | Easier to maintain and no cascade surprises with Tailwind. |
| Smooth scroll | Vendor Lenis 1.3.26 locally (`src/lenis.min.js`), same duration/easing as the reference. Disabled under `prefers-reduced-motion`. | No third-party CDN dependency; keeps the "movement". |
| Splash overlay | **Removed.** Its photos become the content of the new sections. | The reference has no intro splash; the hero is the statement. |
| DaisyUI | Removed. Tailwind stays for preflight and a few utilities. | All components are now custom CSS. |
| Header line 2 | "TATTOO ARTIST" (static) in place of time + location. | We have no studio location to show; a clock without a place is noise. |
| Nav items | FLASH / AFTERCARE (col 1), INSTAGRAM ↗ (col 2), BOOK NOW ↗ (CTA). HOME is the logotype. | Our five existing links. |
| Artist photo | Omitted; H1 starts at the page edge like the reference home/book pages. | None exists. |
| About / News / Media / FAQ / Map / Newsletter | Omitted. | No content. |
| Legacy pages `fine_line.html`, `pet_portraits.html` | Restyled and added to the generator map so they regenerate with the rest. | They exist in the repo and would otherwise be left with dead CSS classes. |

## 3. Pages

### 3.1 Shared layout (`page.templ`)
- `<header class="site-header">` fixed, blend/invert. Left: `TAT.IT.TOO` (bold .9em, links home) over `TATTOO ARTIST` (.8em). Right: 3-col grid (`FLASH`,`AFTERCARE` | `INSTAGRAM ↗` | `BOOK NOW ↗`). Mobile (≤767): `MENU` label + hamburger, grid hidden.
- `<nav class="mobile-menu">` full-screen panel: HOME, FLASH, AFTERCARE (huge), bordered `BOOK NOW ↗` row, `FOLLOW → ↗ INSTAGRAM` box. Body scroll locked while open. ESC closes. Focus moves into the panel and back.
- `<main>` children.
- `<footer class="site-footer">` black: left `BACK TO TOP` bordered button; right columns `DISCOVER` (HOME, FLASH, BOOK, AFTERCARE) and `FOLLOW US` (↗ INSTAGRAM); bottom hairline row `© {year} TAT.IT.TOO — ALL RIGHTS RESERVED`.
- `<script defer src="src/site.js">` + Lenis.

### 3.2 Index
1. **Hero** `85vh` (65vh ≤991, auto ≤479): H1 `TAT.IT.TOO` (~12vw, 700, -.05em, lh .75, fade-up on load). Bottom row: `STYLES` → "Fine Line, Animal Portraits, Flash" (each a link) | `FOLLOW` → "@tat.it.too ↗".
2. **Full-bleed photo** `IMG_2932` (62em ≈ 890px desktop, 45vh mobile), gentle parallax + scale-in on scroll.
3. **Latest works** `#latest`: H2 "Latest works"; 72em stage (capped at 100vh) with crossfading photos `IMG_0057`, `IMG_5077`, `IMG_4760`; 3 thumbnails bottom-right (12em × 15em, opacity .8 → 1 active). Mobile: stage 92em then thumbnails as a 3-col strip underneath.
4. **2-up grid**: `IMG_2265`, `IMG_3149` (57.5em tall, 1fr 1fr; stacked ≤479).
5. **Pinned gallery** `#gallery`: 300vh track; sticky viewport with left photo `IMG_8282` (76% wide, 100vh) and right column (24%) of `IMG_4167`, `sample.webp`, `IMG_5725`, `butterfly.webp` each 29em tall, translated up by scroll progress. ≤991: no pin, left photo 80em tall, column becomes a 2-col grid; ≤479 single column.
6. **CTA strip**: `BOOK` | `NOW ↗` at 112px (7.8em mobile), hairline top, arrow box with left hairline; whole strip links to `book.html`; hover slides arrow up-right.
7. **Fixed bottom bar**: `• LATEST WORKS`, `• GALLERY`, right `BOOK NOW ↗`. Active state via IntersectionObserver. ≤767 only the CTA.

### 3.3 Flash
- Hero: H1 `FLASH` (uppercase bold ~7em), blurb `PRE-DRAWN DESIGNS, READY TO BOOK.` in small uppercase.
- Filter row (hairlines top/bottom): `○ ALL n`, `● AVAILABLE n`, `○ CLAIMED n`; clicking filters the grid (JS, counts computed from the DOM). Default: ALL.
- Two groups with small uppercase group labels `NEW FLASH`, `OLD FLASH`.
- Grid: 5 cols ≥1280, 4 ≥992, 3 ≥768, 2 below; 1px gaps on grey like the reference. Card: white image area (3:4, `object-fit: contain`, 8% padding), caption `DESIGN F` + `AVAILABLE` / `CLAIMED`. Claimed: image greyscale + 35% opacity, caption muted.
- Modal: keep existing behaviour (focus, ESC, keyboard), restyle: grey card, `BOOK THIS DESIGN ↗` black button, `CLAIMED` hairline label.

### 3.4 Book
- Hero: H1 `BOOK YOUR` / `TATTOO`, min-height ~45vh.
- Tab row: `BOOK ●` (active) | `FLASH ○` → flash.html (muted) with hairlines, 2.6em bold uppercase.
- Left half (full width ≤767): "Tell me what you have in mind." → `GENERAL INFORMATION` / `*REQUIRED` row → 2-col field grid (Full name, Email | Phone, Preferred day | Tattoo type full width) → dynamic fields → `SEND REQUEST ↗` black button. Inputs: 1px hairline, 3px radius, transparent bg, 14px/16px padding, `.8em` labels. Existing validation, reCAPTCHA lazy-load and templates unchanged.

### 3.5 Aftercare
- Hero ~85vh: H1 `Tattoo` / `Aftercare` (7em, 400, lh .8), intro paragraph bottom-left (max 27%): "Every artist heals a little differently. This is how I want you to look after yours."
- Rows (hairline between): `First days` / list; `Days 5–14` / list; `Avoid` / list; `Healing time` / list. Title left 35%, body right.

### 3.6 Thank you, 404, fine line, pet portrait
- Hero-style pages: giant heading (`THANK` / `YOU`, `404`, `FINE LINE` / `& REALISM`, `PET` / `PORTRAITS`), existing copy as `b-txt` on the right or below, `BACK HOME ↗` link where it applies.

## 4. Files

| File | Change |
|---|---|
| `src/main.css` | Rewritten: tokens, fonts, header, menu, footer, bar, hero, sections, flash, book, aftercare, utility pages, reduced-motion. |
| `src/input.css` | Drop DaisyUI plugin. |
| `src/site.js` | New: Lenis boot, menu, active nav, anchors bar, parallax, pinned gallery, works switcher, back-to-top, year. |
| `src/lenis.min.js` | Vendored Lenis 1.3.26. |
| `src/fonts/` | Switzer woff2 (300/400/500/700) + license; DM Sans removed. |
| `page.templ`, `index.templ`, `flash.templ`, `book.templ`, `aftercare.templ`, `thank_you.templ`, `not_found.templ`, `fine_line.templ`, `pet_portrait.templ` | Rewritten markup. |
| `main.go` | Add fine_line/pet_portraits to the generator map. |
| `package.json` | Remove `@fontsource/dm-sans`, `daisyui`, `@tailwindcss/typography`. |
| `*_templ.go`, `*.html`, `src/tailwind.css` | Regenerated via `task generate`. |

## 5. Verification
- `task generate` succeeds; `go vet` clean.
- Headless-Chrome screenshots of every page at 1440×900 and 390×844 compared side by side with the reference captures.
- Keyboard pass: skip link, menu open/close with focus return, flash modal, form validation messages.
- `prefers-reduced-motion`: no Lenis, no parallax, instant crossfades.

## 6. Out of scope
- Dark mode, sound toggle, newsletter, map, blog/news, FAQ accordion.
- Any backend/form submission changes.
