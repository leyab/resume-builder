# Resume Builder

A small JSON-driven resume renderer built with HTML, CSS and vanilla JavaScript. Created as a personal learning project with AI assistance.

## Features
- Separate structured content and presentation
- Reusable rendering for experience, projects, education and language sections
- Configurable section labels and display options
- A4 print stylesheet for browser PDF export
- HTML escaping for rendered text

## Run locally
From the repository root:

```sh
python -m http.server 8000
```

Open http://localhost:8000/src/ in your browser. Use the browser print dialog and select Save as PDF, A4 paper and no browser headers/footers. Check the print preview; long profiles may require layout adjustments.

## Customize
Edit `src/data/demo.json`. To add profiles, add a JSON file and register it in `RESUME_FILES` in `src/script.js`, then select it with `?resume=profile-name`.

Only fictional demonstration data is included. Keep personal profiles outside public Git history. There is no backend, visual editing interface or automatic PDF generation service. The default template uses Google Fonts and falls back to system fonts when offline.
