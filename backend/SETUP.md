# VIDZN lead backend — setup (about 5 minutes)

```
Website form  ──►  Google Apps Script  ──►  Google Sheet "Leads"
(home + services)        │                        ▲
                         ├─► email alert to you   │
                         └─► auto-reply to client │
                                                  │
vidzn-leads.html (your private dashboard) ────────┘  read + update status/notes
```

## 1. Create the sheet + script
1. Go to sheets.new and name the sheet something like **VIDZN Leads**.
2. **Extensions → Apps Script**. Delete the sample code and paste all of `backend/apps-script.gs`.
3. At the top, edit `CONFIG`:
   - `NOTIFY_EMAIL`: where new-lead alerts go.
   - `ADMIN_KEY`: a long random phrase. This is your dashboard password, so treat it like one.
   - `SEND_AUTO_REPLY` / `REPLY_WITHIN`: the confirmation email the client gets.
4. Click **Save**, choose `setup` in the function dropdown and press **Run**. Approve the permissions (it's your own script). A formatted **Leads** tab appears.

## 2. Deploy it
1. **Deploy → New deployment → ⚙ → Web app**.
2. *Execute as*: **Me**. *Who has access*: **Anyone**. (Visitors can only submit leads; reading them needs the admin key.)
3. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).

## 3. Connect the site
Paste the URL into `vidzn-config.js`:
```js
FORM_ENDPOINT: "https://script.google.com/macros/s/XXXX/exec",
```
Both the homepage contact form and the services-page enquiry now post there.

## 4. Open the dashboard
Open `vidzn-leads.html` and sign in with the same URL plus your `ADMIN_KEY`.
You can see stats, a pipeline, filters, one-click reply by email or WhatsApp, status changes and notes, and CSV export.
Status and notes changes are written back to the sheet.

## Good to know
- **Editing the script later:** after changing code, go to **Deploy → Manage deployments → ✎ → Version: New version**. This keeps the same URL.
- **Budget/timeline labels** in the services form must match `BUDGET_SCORE` / `TIMELINE_SCORE` in the script. Those two tables decide Hot/Warm/Cold priority.
- **Spam:** a hidden honeypot field silently drops most bots. If spam gets through, add Cloudflare Turnstile later.
- **Email limits:** a free Gmail account can send about 100 emails a day through Apps Script, and Workspace about 1,500. Each lead uses 2 (the alert and the auto-reply).
- `vidzn-leads.html` has `noindex` and holds no data itself, so it's safe to host alongside the site. You can also keep it off the public server and open it locally.
