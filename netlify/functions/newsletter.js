// Newsletter sign-up -> Mailchimp (This Is Me audience).
// Needs one environment variable in Netlify: MAILCHIMP_API_KEY (e.g. abc123...-us2).
const crypto = require("crypto");
const LIST_ID = process.env.MAILCHIMP_LIST_ID || "aa68619c21";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const key = process.env.MAILCHIMP_API_KEY;
  if (!key) return { statusCode: 501, body: JSON.stringify({ error: "not-configured" }) };
  let email = "";
  try { email = String(JSON.parse(event.body || "{}").email || "").trim(); } catch (e) {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { statusCode: 400, body: JSON.stringify({ error: "invalid-email" }) };
  const dc = key.split("-").pop();
  const hash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
  const auth = "Basic " + Buffer.from("thisisme:" + key).toString("base64");
  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}`;
  const res = await fetch(base, {
    method: "PUT",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ email_address: email, status_if_new: "subscribed" })
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Mailchimp error", res.status, t.slice(0, 300));
    return { statusCode: 502, body: JSON.stringify({ error: "mailchimp" }) };
  }
  // Tag where they signed up (best effort)
  fetch(base + "/tags", { method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ tags: [{ name: "Website", status: "active" }] }) }).catch(() => {});
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
