// VIDZN site config — shared by the homepage, services page and lead dashboard.
// Paste your Google Apps Script Web App URL (ends in /exec) below. See backend/SETUP.md.
window.VIDZN_CONFIG = {
  FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycbyJJ7vDakY-gBz-LUof7Tzn-1iO_0mbMgolBMD5zSb2e-Dx-8zQPM_IvWI106iNSNdYRw/exec",
};

// Sends a website enquiry to the lead backend. Resolves to { ok, id } or throws.
window.vidznSubmitLead = async (fields) => {
  const endpoint = window.VIDZN_CONFIG.FORM_ENDPOINT;
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([k, v]) => [].concat(v).forEach(x => body.append(k, x)));
  if (!endpoint) {
    console.warn("VIDZN: FORM_ENDPOINT is not set in vidzn-config.js — enquiry not sent.", Object.fromEntries(body));
    return { ok: true, id: "PREVIEW" };
  }
  // url-encoded body = a "simple" request, so the browser skips the CORS preflight Apps Script can't answer.
  const res = await fetch(endpoint, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
  return data;
};
