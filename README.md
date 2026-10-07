# tatit2.com

Custom website for Patchare Ake.

## Workflow

### Technologies

- TailwindCSS and TailwindCSSCli for the CSS reset; all component styles live in `src/main.css`
- Switzer (Fontshare, ITF Free Font License) self-hosted in `src/fonts/` — ship the woff2 files as-is, the license forbids subsetting or converting them
- Lenis smooth scroll, vendored in `src/lenis.min.js`; shared behaviour (menu, anchors bar, gallery pin, parallax) in `src/site.js`
- Templ for HTML templating
- Golang to generate HTML files
- Taskfile for scripts management

### How To

1. Modify the *.templ files
2. Run `task generate` to generate CSS, Go, and HTML files
3. Publish this to GitHub
4. The GitHub Actions task should bundle and deploy the *.html files

## Design

The look follows `docs/superpowers/specs/2026-10-07-monolith-redesign-design.md`. Preview locally with `python3 -m http.server` (fonts are blocked under `file://`).
