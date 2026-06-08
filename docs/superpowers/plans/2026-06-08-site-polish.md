# Site Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh tat.it.too to a high-contrast editorial aesthetic (white/black, DM Sans, underline inputs) with mobile UX improvements (flash 2-col grid, flash modal CTA) and two performance wins (self-hosted font, lazy reCAPTCHA).

**Architecture:** All visual changes live in `src/main.css`. Template changes touch `page.templ`, `book.templ`, and `flash.templ`. After every template edit, regenerate via `templ generate && go run .`. CSS is rebuilt via `npx @tailwindcss/cli -i ./src/input.css -o ./src/tailwind.css --minify` (run via `task generate`).

**Tech Stack:** Go + templ, Tailwind v4, DaisyUI v5 (themes: false), static HTML output

---

## File map

| File | What changes |
|---|---|
| `src/fonts/` | New — DM Sans woff2 files (300, 400, 500, 600) |
| `src/main.css` | Color tokens, @font-face, body font, nav, buttons, form inputs, flash grid, modal CTA |
| `page.templ` | Remove Google Fonts links; add self-hosted font preload |
| `book.templ` | Lazy reCAPTCHA; remove DaisyUI `input`/`select`/`textarea`/`file-input` classes from form markup |
| `flash.templ` | Add "Book this design" CTA to modal |
| `page_templ.go`, `book_templ.go`, `flash_templ.go`, all `*.html` | Regenerated automatically |

---

## Task 1: Install DM Sans and copy font files

**Files:**
- Create: `src/fonts/` (directory)
- Modify: `package.json` (new dependency)

- [ ] **Step 1: Install @fontsource/dm-sans**

```bash
npm install @fontsource/dm-sans
```

- [ ] **Step 2: Confirm woff2 filenames**

```bash
ls node_modules/@fontsource/dm-sans/files/ | grep 'latin-[0-9].*normal.woff2'
```

Expected output (4 lines):
```
dm-sans-latin-300-normal.woff2
dm-sans-latin-400-normal.woff2
dm-sans-latin-500-normal.woff2
dm-sans-latin-600-normal.woff2
```

- [ ] **Step 3: Copy font files**

```bash
mkdir -p src/fonts
cp node_modules/@fontsource/dm-sans/files/dm-sans-latin-300-normal.woff2 src/fonts/
cp node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2 src/fonts/
cp node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2 src/fonts/
cp node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2 src/fonts/
```

Verify: `ls src/fonts/` should list 4 woff2 files.

- [ ] **Step 4: Commit**

```bash
git add src/fonts/ package.json package-lock.json
git commit -m "feat: add self-hosted DM Sans font files"
```

---

## Task 2: Add @font-face declarations, update color tokens, and switch body font

**Files:**
- Modify: `src/main.css` — top section (`:root` block and before it)

- [ ] **Step 1: Add @font-face rules at the top of `src/main.css`, before any existing rules**

Insert this block as the first lines of the file:

```css
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('./fonts/dm-sans-latin-300-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./fonts/dm-sans-latin-400-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./fonts/dm-sans-latin-500-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./fonts/dm-sans-latin-600-normal.woff2') format('woff2');
}
```

- [ ] **Step 2: Update the `:root` block**

Find the existing `:root` block (currently around line 57) and replace it entirely:

```css
:root {
  --page-bg: #ffffff;
  --text-primary: #000000;
  --text-muted: #666666;
  --border-subtle: rgba(0, 0, 0, 0.1);
  --nav-bg: rgba(255, 255, 255, 0.95);
}
```

- [ ] **Step 3: Update body font-family**

Find the `body` rule and change `font-family`:

```css
body {
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  margin: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--page-bg);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Update the splash logo font reference**

Find `.splash-logo` and change `font-family`:

```css
.splash-logo {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10000;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: clamp(2.25rem, 12vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #fff;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/main.css
git commit -m "feat: switch to DM Sans, update color tokens to high-contrast B&W"
```

---

## Task 3: Update nav and button styles

**Files:**
- Modify: `src/main.css` — nav and button sections

- [ ] **Step 1: Update nav link styles**

Find `.page-body > nav .menu a` and replace:

```css
.page-body > nav .menu a {
  transition: color 0.2s ease, opacity 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.6875rem;
  font-weight: 500;
}

.page-body > nav .menu a:hover {
  opacity: 0.5;
}
```

- [ ] **Step 2: Add active nav CSS rule to `src/main.css`**

Add after the nav link styles:

```css
.menu li.nav-active > a {
  color: var(--text-primary);
  opacity: 1;
  font-weight: 600;
  border-bottom: 1.5px solid #000;
  padding-bottom: 1px;
}
```

- [ ] **Step 3: Update button styles**

Find `.btn-hip` and replace:

```css
.btn-hip {
  border-radius: 0 !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.6875rem !important;
  transition: transform 0.15s ease, background-color 0.2s ease, color 0.2s ease;
}
.btn-hip:active {
  transform: scale(0.97);
}
@media (hover: hover) {
  .btn-hip:hover {
    transform: translateY(-1px);
  }
  .btn-hip:active {
    transform: translateY(-1px) scale(0.98);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/main.css
git commit -m "feat: update nav active state, button styles to high-contrast editorial"
```

---

## Task 4: Overhaul form input styles and update flash grid

**Files:**
- Modify: `src/main.css` — book form section and flash grid section

- [ ] **Step 1: Replace `.book-input` and `.book-select` shared styles**

Find the `.book-input, .book-select { ... }` block and replace entirely:

```css
.book-input,
.book-select {
  display: block;
  width: 100%;
  padding: 0.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
  font-family: inherit;
  color: var(--text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0;
  transition: border-color 0.15s ease;
  -webkit-appearance: none;
  appearance: none;
  min-height: 2.5rem;
}
.book-input::placeholder {
  color: #bbb;
  font-weight: 300;
  opacity: 1;
}
.book-input:hover,
.book-select:hover {
  border-bottom-color: rgba(0, 0, 0, 0.4);
}
.book-input:focus,
.book-select:focus {
  outline: none;
  border-bottom: 1.5px solid #000;
  box-shadow: none;
}
```

- [ ] **Step 2: Replace invalid state styles**

Find the `.form-attempted .book-input:invalid` block and replace:

```css
.form-attempted .book-input:invalid,
.form-attempted .book-select:invalid {
  border-bottom-color: #b91c1c;
  border-bottom-width: 1.5px;
  outline: none;
}
.form-attempted .book-input:invalid:focus,
.form-attempted .book-select:invalid:focus {
  border-bottom-color: #b91c1c;
  box-shadow: none;
}
```

- [ ] **Step 3: Replace `.book-select` specific styles**

Find the standalone `.book-select { ... }` rule and replace:

```css
.book-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 1rem;
  padding-right: 1.5rem;
  width: 100%;
  max-width: none;
  text-overflow: unset;
}
```

- [ ] **Step 4: Replace `.book-legend` styles**

Find `.book-legend { ... }` and replace:

```css
.book-legend {
  display: block;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.625rem;
}
.book-legend.required-label::after {
  color: #999;
}
```

- [ ] **Step 5: Replace `.book-file` styles**

Find `.book-file { ... }` and `.book-file::file-selector-button { ... }` and replace both:

```css
.book-file {
  width: 100%;
  font-size: 0.875rem;
  color: var(--text-primary);
  font-family: inherit;
}
.book-file::file-selector-button {
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: #000;
  border: none;
  border-radius: 0;
  padding: 0.4rem 0.75rem;
  margin-right: 0.75rem;
  transition: opacity 0.15s ease;
  cursor: pointer;
}
.book-file::file-selector-button:hover {
  opacity: 0.8;
}
```

- [ ] **Step 6: Fix flash grid mobile — change 1-col to 2-col**

Find the first `@media (min-width: 640px)` block inside the flash section. Just above it is the base `.flash-grid` rule (no media query). Find and replace it:

```css
.flash-grid {
  display: grid;
  gap: 2px;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
}
```

- [ ] **Step 7: Add `gap` to `.flash-modal-inner`**

Find `.flash-modal-inner { ... }` and add `gap: 12px`:

```css
.flash-modal-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 100%;
  max-height: calc(100vh - 4rem);
  max-height: calc(100dvh - 4rem);
}
```

- [ ] **Step 8: Add flash modal CTA styles**

Add after the `.flash-modal-caption { ... }` rule:

```css
.flash-modal-cta {
  display: block;
  width: min(85vw, 400px);
  background: #fff;
  color: #000;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  font-family: inherit;
  margin-top: 2px;
  transition: opacity 0.15s ease;
}
.flash-modal-cta:hover {
  opacity: 0.8;
}
```

- [ ] **Step 9: Commit**

```bash
git add src/main.css
git commit -m "feat: underline form inputs, uppercase labels, 2-col flash grid, modal CTA styles"
```

---

## Task 5: Update page.templ — remove Google Fonts + fix nav active class

**Files:**
- Modify: `page.templ`

- [ ] **Step 1: Update nav active class in `page.templ` JS**

Find:
```javascript
var el = document.getElementById(path);
if (el) el.classList.add('border-b');
```

Replace with:
```javascript
var el = document.getElementById(path);
if (el) el.classList.add('nav-active');
```

- [ ] **Step 3: Remove Google Fonts links from `page.templ`**

Find and remove these four lines:

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
```

and:

```html
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet"/>
```

Also remove the two preconnect lines for `www.google.com` and `www.gstatic.com` if they exist only for reCAPTCHA — **leave them in** since reCAPTCHA still uses them:

```html
<link rel="preconnect" href="https://www.google.com"/>
<link rel="preconnect" href="https://www.gstatic.com" crossorigin/>
```

These two stay. Only remove the `fonts.googleapis.com` and `fonts.gstatic.com` preconnects.

- [ ] **Step 4: Regenerate `page_templ.go` and all HTML files**

```bash
templ generate && go run .
```

Expected: no errors, all `*.html` files regenerated.

- [ ] **Step 5: Verify Google Fonts is gone from generated HTML**

```bash
grep -c "fonts.googleapis.com" index.html
```

Expected output: `0`

- [ ] **Step 6: Commit**

```bash
git add page.templ page_templ.go index.html book.html flash.html aftercare.html thank_you.html 404.html
git commit -m "perf: remove Google Fonts CDN, use self-hosted DM Sans; fix nav active indicator"
```

---

## Task 6: Update flash.templ — add "Book this design" CTA to modal

**Files:**
- Modify: `flash.templ`

- [ ] **Step 1: Add CTA link after the modal image div**

In `flash.templ`, find the modal inner section:

```html
<div class="flash-modal-inner">
    <button type="button" class="flash-modal-close" aria-label="Close">×</button>
    <div class="flash-modal-image">
        <img id="flash-modal-img" class="flash-modal-img" src="" alt="">
    </div>
</div>
```

Replace with:

```html
<div class="flash-modal-inner">
    <button type="button" class="flash-modal-close" aria-label="Close">×</button>
    <div class="flash-modal-image">
        <img id="flash-modal-img" class="flash-modal-img" src="" alt="">
    </div>
    <a href="book.html" class="flash-modal-cta">Book this design →</a>
</div>
```

- [ ] **Step 2: Regenerate**

```bash
templ generate && go run .
```

- [ ] **Step 3: Verify CTA is in generated HTML**

```bash
grep -c "Book this design" flash.html
```

Expected output: `1`

- [ ] **Step 4: Commit**

```bash
git add flash.templ flash_templ.go flash.html
git commit -m "feat: add 'Book this design' CTA to flash modal"
```

---

## Task 7: Update book.templ — lazy reCAPTCHA + remove DaisyUI class conflicts

**Files:**
- Modify: `book.templ`

- [ ] **Step 1: Remove the eager reCAPTCHA script tag**

At the very top of `book.templ`, find and remove:

```html
<script src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit" defer></script>
```

- [ ] **Step 2: Add lazy reCAPTCHA loader inside the existing `<script>` block**

Inside the existing `<script>` tag (which starts with `var recaptchaWidgetId;`), find the `document.addEventListener('DOMContentLoaded', function() {` block. Add the lazy loader at the **top** of that callback, before the existing `var form = ...` line:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    var recaptchaLoaded = false;
    function loadRecaptcha() {
        if (recaptchaLoaded) return;
        recaptchaLoaded = true;
        var s = document.createElement('script');
        s.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit';
        s.async = true;
        document.head.appendChild(s);
    }
    var formEl = document.getElementById('booking-form');
    if (formEl) formEl.addEventListener('focusin', loadRecaptcha, { once: true });

    // ... rest of the existing DOMContentLoaded code unchanged below ...
```

Also remove the call to `onRecaptchaReady()` at the bottom of `DOMContentLoaded` since it's now triggered by the script's `onload`:

Find and remove this line near the end of the `DOMContentLoaded` callback:
```javascript
onRecaptchaReady();
```

- [ ] **Step 3: Remove DaisyUI conflicting classes from form inputs**

In `book.templ`, do these find-and-replace operations (throughout the whole file, including inside all `<template>` tags):

1. `class="book-input input w-full"` → `class="book-input w-full"`
2. `class="book-input book-select select input w-full"` → `class="book-input book-select w-full"`
3. `class="book-input textarea w-full"` → `class="book-input w-full"`
4. `class="book-file file-input"` → `class="book-file"`

- [ ] **Step 4: Regenerate**

```bash
templ generate && go run .
```

- [ ] **Step 5: Verify reCAPTCHA script is no longer eager-loaded**

```bash
grep -c "recaptcha/api.js" book.html
```

Expected output: `0` (the script is now injected dynamically by JS, not in the HTML)

- [ ] **Step 6: Verify DaisyUI input classes are gone from generated HTML**

```bash
grep -c '"book-input input ' book.html
```

Expected output: `0`

- [ ] **Step 7: Commit**

```bash
git add book.templ book_templ.go book.html
git commit -m "perf: lazy-load reCAPTCHA on first input focus; remove DaisyUI class conflicts"
```

---

## Task 8: Rebuild CSS and final visual verification

**Files:**
- Modify: `src/tailwind.css` (regenerated)
- Modify: all `*.html` (already regenerated, just rebuild CSS)

- [ ] **Step 1: Rebuild Tailwind CSS**

```bash
task css
```

Expected: `src/tailwind.css` updated (minified). No errors.

- [ ] **Step 2: Run full generate to make everything consistent**

```bash
task generate
```

Expected: CSS rebuilt, all templ files regenerated, all HTML files updated.

- [ ] **Step 3: Open `book.html` in a browser and check the form**

Verify:
- Font is DM Sans (not EB Garamond)
- Background is pure white
- Form labels are small, uppercase, letter-spaced
- Inputs show only a bottom border (no box)
- Active input has a solid black bottom border
- Submit button is flat black, uppercase, no border-radius

- [ ] **Step 4: Open `flash.html` in a browser and check the grid + modal**

Verify:
- On a narrow viewport (~375px wide), the flash grid shows 2 columns
- Clicking a design opens the modal
- Below the image, "Book this design →" CTA is visible
- Clicking the CTA navigates to `book.html`

- [ ] **Step 5: Open `index.html` and check homepage**

Verify:
- Background is white
- "tat.it.too" title is in DM Sans
- Buttons are flat black, uppercase, no rounded corners

- [ ] **Step 6: Final commit**

```bash
git add src/tailwind.css index.html book.html flash.html aftercare.html thank_you.html 404.html
git commit -m "feat: rebuild CSS for high-contrast editorial site polish"
```
