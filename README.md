# Trafy AI Engineer Cohort site

Static site. Links and asset paths start with `/cohort/`, so serve this folder at `/cohort`.

- `index.html` is the cohort page (hero, build ladder, curriculum accordion, perks, evaluation, FAQ) with the lead popup.
- `css/cohort.css`, `js/cohort.js` drive the new page. Set `LEAD_ENDPOINT` at the top of `cohort.js` to receive leads (JSON POST); until then they are stored only in the visitor's localStorage.
- `assets/downloads/trafy-ai-engineer-cohort-curriculum.pdf` is the file the popup delivers.
- `cohort-26.html` redirects to the curriculum section. `employability-index`, `trafy-startup` and the blog pages are from the earlier site and still use the old design and Cohort '26 wording.
