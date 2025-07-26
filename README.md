# tatit2.com

Custom website for Patchare Ake.

## Workflow

### Technologies

- TailwindCSS and TailwindCSSCli for styles
- Templ for HTML templating
- Golang to generate HTML files
- Taskfile for scripts management

### How To

1. Modify the *.templ files
2. Run `task generate` to generate CSS, Go, and HTML files
3. Publish this to GitHub
4. The GitHub Actions task should bundle and deploy the *.html files
