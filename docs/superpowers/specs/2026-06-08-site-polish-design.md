# Site Polish — Design Spec
**Date:** 2026-06-08
**Scope:** Option B — Full Polish (aesthetics + mobile UX + performance)

---

## Overview

Refresh tat.it.too from its current warm-cream/EB Garamond look to a high-contrast editorial aesthetic: pure white background, pure black text, DM Sans geometric sans-serif, underline-only form inputs. Paired with targeted mobile UX improvements (flash 2-col grid, flash modal CTA) and two performance quick-wins (self-host font, defer reCAPTCHA).

---

## 1. Visual Design

### Color palette
| Token | Old | New |
|---|---|---|
| `--page-bg` | `#f8f7f4` | `#ffffff` |
| `--text-primary` | `#0f0f0f` | `#000000` |
| `--text-muted` | `#404040` | `#666666` |
| `--border-subtle` | `rgba(15,15,15,0.08)` | `rgba(0,0,0,0.1)` |
| `--nav-bg` | `rgba(248,247,244,0.92)` | `rgba(255,255,255,0.95)` |

### Typography
- **Remove** Google Fonts CDN link for EB Garamond
- **Add** self-hosted DM Sans (300, 400, 500, 600 weights) via `@font-face` in `src/main.css`
- Download font files from Google Fonts and place in `src/fonts/`
- **Body font:** `font-family: 'DM Sans', system-ui, -apple-system, sans-serif`
- **Fallback stack** ensures no invisible text while font loads

### Navigation
- Links: `text-transform: uppercase`, `letter-spacing: 0.08em`, `font-size: 0.6875rem` (11px), `font-weight: 500`
- Active indicator: `border-bottom: 1.5px solid #000` (currently just DaisyUI `border-b` class — more visible)
- Nav background: `rgba(255,255,255,0.95)` with `backdrop-filter: blur(8px)` (unchanged)

### Buttons
- Remove `border-radius` (currently `0.375rem`) → `border-radius: 0`
- `letter-spacing: 0.08em`, `text-transform: uppercase`, `font-size: 0.6875rem`, `font-weight: 600`
- Primary: `background: #000; color: #fff`
- Outline: `background: #fff; color: #000; border: 1px solid #000`

### Form inputs (book page)
Replace boxed inputs with underline-only style:

- **Remove** `border: 1px solid var(--border-subtle)` and `border-radius`
- **Add** `border: none; border-bottom: 1px solid #ddd`
- **Focus state:** `border-bottom: 1.5px solid #000; box-shadow: none`
- **Placeholder:** `color: #bbb; font-weight: 300`
- **Filled/active:** `color: #000; font-weight: 400`
- **Padding:** `padding: 8px 0` (no horizontal padding — flush left)
- **Labels:** `text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.625rem; font-weight: 500` (currently `0.875rem`, no uppercase)
- **Select:** replace SVG chevron background-image with updated one; keep right-side arrow, just remove box
- **Textarea** (new description field): same underline treatment
- **File inputs:** `border-bottom: 1px solid #ddd` on the wrapper; button gets flat black style

---

## 2. Mobile UX

### Flash grid — 2-column on mobile
- Change `grid-template-columns: repeat(1, 1fr)` (the `< 640px` breakpoint) to `repeat(2, 1fr)`
- Change gap from `2px` to `2px` (unchanged)
- No other layout changes needed

### Flash modal — "Book this design" CTA
- Add a `<a>` button below the modal image linking to `book.html`
- Text: `Book this design →`
- Style: flat black button, full width of the modal image
- The link goes to `book.html` (no pre-selection needed — user can choose flash type in the form)
- Modal inner layout: `flex-direction: column; align-items: center; gap: 12px`

---

## 3. Performance

### Self-host DM Sans
- Download DM Sans woff2 files (300, 400, 500, 600) from Google Fonts
- Place in `src/fonts/`
- Declare `@font-face` rules in `src/main.css` with `font-display: swap`
- Remove `<link>` tags for Google Fonts (preconnect + stylesheet) from `page.templ`
- Remove `<link rel="preconnect" href="https://fonts.googleapis.com">` and `https://fonts.gstatic.com`

### Defer reCAPTCHA
- Remove `defer` attribute from the reCAPTCHA `<script>` tag in `book.templ` — it's not enough
- Instead: don't load the script at all until the user first focuses any form input
- On first `focusin` event on `#booking-form`: dynamically insert the reCAPTCHA script tag
- Call `onRecaptchaReady()` in the script's `onload` callback
- This saves ~140kb of JS on page open for users who don't complete the form

---

## 4. Files to change

| File | What changes |
|---|---|
| `src/main.css` | Color tokens, font-face declarations, nav styles, button styles, form input styles, flash grid (mobile breakpoint) |
| `src/fonts/` | New directory — DM Sans woff2 files |
| `page.templ` + `page_templ.go` | Remove Google Fonts links; add font preload for self-hosted files |
| `book.templ` + `book_templ.go` | reCAPTCHA lazy-load JS, form input/label markup adjustments (remove `border-radius` classes) |
| `flash.templ` + `flash_templ.go` | Add CTA button to modal |
| All `*.html` | Regenerated via `templ generate && go run .` |

---

## 5. Out of scope

- Homepage layout rethink (Option C — deferred)
- Dark mode
- Animations beyond what exists
- Any changes to form submission logic or backend
