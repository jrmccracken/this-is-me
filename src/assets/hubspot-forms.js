/*
  Newsletter sign-up
  ------------------
  The sign-up form is part of the page design.

  MAILCHIMP: paste the "action" link from Mailchimp's embedded form code into
  mailchimpAction below (Audience > Signup forms > Embedded forms, then look for
  <form action="https://....list-manage.com/subscribe/post?u=...&id=...">).
  Once that is filled in, every sign-up goes to Mailchimp.

  HUBSPOT: while mailchimpAction is empty, sign-ups go to the HubSpot
  "newsletter" form instead, with the marketing consent set up below.
*/
window.THIS_IS_ME_MAILCHIMP = {
  mailchimpAction: "https://thisisme.us2.list-manage.com/subscribe/post?u=b877b1e51f9750f7e2a5f2e15&id=aa68619c21"
};

window.THIS_IS_ME_HUBSPOT = {
  portalId: "149441597",
  newsletterFormId: "fde5e3b4-4e4a-42f9-85df-5d37a94c5c88",
  subscriptionTypeId: 3732988720,
  consentText: "By signing up, you agree to receive our newsletter and other communications from This is Me. You can unsubscribe anytime.",
  processingText: "To deliver your service, we need your permission to store and process your personal data."
};

(function () {
  const cfg = window.THIS_IS_ME_HUBSPOT;
  // Send to Mailchimp through the site's own connector; if that isn't set up yet,
  // fall back to posting to Mailchimp's hosted form in the background (still adds them to the audience).
  function mailchimp(action, email) {
    return fetch("/.netlify/functions/newsletter", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email })
    }).then(function (r) {
      if (r.ok) return { result: "success" };
      if (r.status === 400) return { result: "error", msg: "invalid email" };
      throw new Error("connector " + r.status);
    }).catch(function () {
      var frame = document.getElementById("mc-frame");
      if (!frame) { frame = document.createElement("iframe"); frame.name = frame.id = "mc-frame"; frame.title = "Newsletter"; frame.style.display = "none"; document.body.appendChild(frame); }
      var f = document.createElement("form");
      f.method = "POST"; f.action = action.replace(/&amp;/g, "&"); f.target = "mc-frame"; f.style.display = "none";
      var i = document.createElement("input"); i.name = "EMAIL"; i.value = email; f.appendChild(i);
      document.body.appendChild(f); f.submit(); f.remove();
      return { result: "success", msg: "opened" };
    });
  }
  document.querySelectorAll("[data-hubspot-form='newsletter']").forEach((slot) => {
    const form = slot.querySelector("form");
    const message = slot.querySelector(".success");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!form.reportValidity()) return;
      const button = form.querySelector("button");
      button.disabled = true;
      const show = (text) => { if (message) { message.textContent = text; message.style.display = "block"; } };
      show("Signing you up…");
      const mc = (window.THIS_IS_ME_MAILCHIMP || {}).mailchimpAction;
      if (mc) {
        mailchimp(mc, input.value.trim()).then((r) => {
          if (r.result === "success" || /already subscribed/i.test(r.msg || "")) { form.reset(); show("Thank you – you’re on the list."); }
          else { console.error("Mailchimp:", r.msg); show("Sorry, that didn’t go through. Please check your email address and try again."); }
        }).catch((err) => { console.error("Newsletter sign-up failed:", err); show("Sorry, that didn’t go through. Please try again in a moment."); })
          .finally(() => { button.disabled = false; });
        return;
      }
      try {
        const res = await fetch(`https://api-eu1.hsforms.com/submissions/v3/integration/submit/${cfg.portalId}/${cfg.newsletterFormId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: [{ objectTypeId: "0-1", name: "email", value: input.value.trim() }],
            context: { pageUri: location.href, pageName: document.title },
            legalConsentOptions: {
              consent: {
                consentToProcess: true,
                text: cfg.processingText,
                communications: [{ value: true, subscriptionTypeId: cfg.subscriptionTypeId, text: cfg.consentText }]
              }
            }
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data.errors && data.errors[0] && data.errors[0].message) || res.status);
        form.reset();
        show("Thank you – you’re on the list.");
      } catch (err) {
        console.error("Newsletter sign-up failed:", err);
        show("Sorry, that didn’t go through. Please check your email address and try again.");
      } finally {
        button.disabled = false;
      }
    });
  });
})();
