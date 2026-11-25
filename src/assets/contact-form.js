/*
  Contact form
  ------------
  Each enquiry is sent to the HubSpot contact form below (this is what decides
  whether the visitor sees "sent"). A copy is also sent to Netlify Forms as a
  backup – that part only works once form detection is switched on in
  Netlify (Site configuration > Forms), and its failure never blocks the visitor.

  HubSpot property names used: firstname, lastname, company, email, message.
*/
window.THIS_IS_ME_CONTACT = {
  portalId: "149441597",
  formId: "2804e06d-dbd1-4b3f-9e62-1eb0b6d50562"
};

(function () {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');
  const cfg = window.THIS_IS_ME_CONTACT;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get("bot-field")) return;

    const name = (data.get("name") || "").trim().split(/\s+/);
    const first = name.shift() || "";
    const last = name.join(" ");
    const fields = [
      ["firstname", first],
      ["lastname", last],
      ["company", data.get("organisation")],
      ["email", data.get("email")],
      ["message", data.get("message")]
    ].filter(([, v]) => v && String(v).trim())
     .map(([name, value]) => ({ objectTypeId: "0-1", name, value: String(value).trim() }));

    button.disabled = true;
    status.textContent = "Sending…";

    // Backup copy to Netlify Forms (ignored if not enabled)
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString()
    }).catch(() => {});

    try {
      const res = await fetch(`https://api-eu1.hsforms.com/submissions/v3/integration/submit/${cfg.portalId}/${cfg.formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, context: { pageUri: location.href, pageName: document.title } })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((body.errors && body.errors[0] && body.errors[0].message) || res.status);
      form.reset();
      status.textContent = "Thank you – your message has been sent. We’ll be in touch soon.";
    } catch (err) {
      console.error("Contact form failed:", err);
      status.textContent = "Sorry, something went wrong. Please try again.";
    } finally {
      button.disabled = false;
    }
  });
})();
