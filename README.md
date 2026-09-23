# VIDZN — We Design What's Next.

Website for VIDZN, a brand, digital and creative direction studio.

## Pages

| File | What it is |
|---|---|
| `index.html` | Homepage — scroll-scrubbed hero reel, selected work, "How a brand is born" story, clients, capabilities, process, solutions, contact |
| `vidzn-services-inner-page.html` | Solutions — START™, LAUNCH™, SCALE™, PARTNER™, comparison, FAQ and a 3-step enquiry form |
| `vidzn-leads.html` | Private lead dashboard (needs the admin key; holds no data itself) |

## Editing content

- **Projects / case studies:** `vidzn-projects.js` — every card, the "All work" view and each case study are built from this list. Put images in `work/<project>/` and point the fields at them.
- **Form backend URL:** `vidzn-config.js`
- **Lead backend (Google Sheets + Apps Script):** `backend/apps-script.gs`, setup steps in `backend/SETUP.md`

## Run locally

Any static server works, e.g. from this folder:

```bash
ruby -run -e httpd . -p 5173
```

Then open http://localhost:5173. (Opening `index.html` directly from disk won't load the hero reel.)
