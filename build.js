/*
  This is Me – site build
  -----------------------
  Netlify runs this on every publish (`npm run build`).

  1. Copies everything in /src to /dist (the published site).
  2. Reads every post in /content/posts (written by Emma in the CMS at /admin).
  3. Creates an article page for each post at /resources/<file-name>.html.
  4. Fills the Learn / Read / Listen / News cards on the Hub page.
  5. Fills the "Thoughts, stories and support…" cards on the home page.

  The page designs live in /src (hub.html, index.html) and /templates/post.html.
*/
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "dist");
const POSTS = path.join(ROOT, "content", "posts");
const VERSION = "42";

const CATEGORIES = {
  learn: "Learn",
  read: "Read",
  listen: "Listen",
  news: "News"
};
const PLACEHOLDER_IMAGE = "/assets/img/case-selfridges.jpg";

marked.setOptions({ gfm: true, breaks: false });

// ---------- helpers ----------
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const POS = { top: "center 10%", upper: "center 25%", centre: "center center", bottom: "center 85%" };
const posStyle = (p) => (p.image_position && POS[p.image_position] ? ` style="object-position:${POS[p.image_position]}"` : "");
const isExternal = (url = "") => /^https?:\/\//i.test(url);
const linkAttrs = (url) => (isExternal(url) ? ' target="_blank" rel="noopener"' : "");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

function fillMarker(html, name, content) {
  const re = new RegExp(`<!-- cards:${name} -->[\\s\\S]*?<!-- /cards:${name} -->`);
  if (!re.test(html)) throw new Error(`Marker "cards:${name}" not found`);
  return html.replace(re, `<!-- cards:${name} -->\n${content}\n<!-- /cards:${name} -->`);
}

function bump(html) {
  return html.replace(/\?v=\d+/g, `?v=${VERSION}`);
}

// ---------- read posts ----------
function loadPosts() {
  if (!fs.existsSync(POSTS)) return [];
  return fs
    .readdirSync(POSTS)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS, file), "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      const body = content.trim();
      const date = data.date ? new Date(data.date) : new Date(0);
      const category = String(data.category || "news").toLowerCase();
      if (!CATEGORIES[category]) throw new Error(`${file}: unknown category "${data.category}"`);
      const hasPage = body.length > 0;
      // Where the card goes: the post's own page, or straight to a link if there's no article
      const href = hasPage
        ? `/resources/${slug}.html`
        : data.link_url || (data.download && data.download.trim()) || "";
      return { ...data, slug, body, date, category, hasPage, href, file };
    })
    .filter((p) => !p.draft);
}

const byOrder = (key) => (a, b) =>
  (Number(a[key]) || 999) - (Number(b[key]) || 999) || b.date - a.date;

// ---------- cards ----------
function hubCard(p) {
  const img = p.card_image || p.image || PLACEHOLDER_IMAGE;
  const alt = p.card_image ? p.card_image_alt || "" : p.image_alt || "";
  const title = p.card_title || p.title;
  const button = p.card_button || "Read more";
  const link = p.href
    ? `<a class="button" href="${esc(p.href)}"${linkAttrs(p.href)}>${esc(button)}</a>`
    : `<span class="button is-disabled" aria-disabled="true">Coming soon</span>`;
  return `          <article class="hub-card">
            <img src="${esc(img)}" alt="${esc(alt)}" loading="lazy"${posStyle(p)}>
            <h3>${esc(title)}</h3>${p.summary ? `\n            <p>${esc(p.summary)}</p>` : ""}
            ${link}
          </article>`;
}

function homeCard(p) {
  const img = p.home_image || p.card_image || p.image || PLACEHOLDER_IMAGE;
  const title = p.home_title || p.card_title || p.title;
  const button = p.home_button || "Read now";
  const href = p.href || "/hub.html";
  return `        <article class="story-card reveal">
          <img src="${esc(img)}" alt="" loading="lazy"${posStyle(p)}>
          <h3>${esc(title)}</h3>
          <a class="button small" href="${esc(href)}"${linkAttrs(href)}>${esc(button)}</a>
        </article>`;
}

// ---------- article pages ----------
function articlePage(template, p) {
  const bodyHtml = marked.parse(p.body);
  let content;
  if (p.image && p.image_style === "portrait") {
    content = `      <div class="download-preview"><img src="${esc(p.image)}" alt="${esc(p.image_alt || "")}"><div>\n${bodyHtml}\n      </div></div>`;
  } else if (p.image) {
    content = `      <img class="article-image" src="${esc(p.image)}" alt="${esc(p.image_alt || "")}"${posStyle(p)}>\n${bodyHtml}`;
  } else {
    content = bodyHtml;
  }

  const actions = [];
  if (p.download) {
    actions.push(`<a class="button" href="${esc(p.download)}" download>${esc(p.download_label || "Download")}</a>`);
  }
  if (p.link_url) {
    actions.push(`<a class="button" href="${esc(p.link_url)}"${linkAttrs(p.link_url)}>${esc(p.link_label || "Find out more")}</a>`);
  }

  const meta = [CATEGORIES[p.category], p.label].filter(Boolean).join(" · ");
  const description = p.summary || p.subtitle || `${p.title} – This is Me by Emma Neville`;
  const fill = {
    title: esc(p.title),
    title_text: esc(p.title),
    description: esc(description),
    og_image: p.card_image || p.image ? `<meta property="og:image" content="${esc(p.card_image || p.image)}">` : "",
    meta: esc(meta),
    subtitle: p.subtitle ? `<p>${esc(p.subtitle)}</p>` : "",
    content,
    actions: actions.join(""),
    hub_anchor: p.category === "learn" ? "#learn" : "",
    version: VERSION
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in fill ? fill[k] : ""));
}

// ---------- build ----------
function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(SRC, OUT);

  const posts = loadPosts();
  const template = fs.readFileSync(path.join(ROOT, "templates", "post.html"), "utf8");

  // Article pages
  fs.mkdirSync(path.join(OUT, "resources"), { recursive: true });
  for (const p of posts.filter((p) => p.hasPage)) {
    fs.writeFileSync(path.join(OUT, "resources", `${p.slug}.html`), articlePage(template, p));
  }

  // Hub cards
  let hub = fs.readFileSync(path.join(OUT, "hub.html"), "utf8");
  for (const cat of Object.keys(CATEGORIES)) {
    // Cards with nowhere to go yet ("Coming soon") stay hidden until they have an article, link or download
    const list = posts.filter((p) => p.category === cat && p.show_on_hub !== false && p.href).sort(byOrder("hub_order"));
    hub = fillMarker(hub, cat, list.map(hubCard).join("\n"));
  }
  fs.writeFileSync(path.join(OUT, "hub.html"), hub);

  // Home page cards (up to 3)
  let home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
  const featured = posts.filter((p) => p.featured_home).sort(byOrder("home_order")).slice(0, 3);
  home = fillMarker(home, "featured", featured.map(homeCard).join("\n"));
  fs.writeFileSync(path.join(OUT, "index.html"), home);

  // Cache-bust CSS/JS on every page
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith(".html") && !f.includes(`${path.sep}admin${path.sep}`)) fs.writeFileSync(f, bump(fs.readFileSync(f, "utf8")));
    });
  walk(OUT);

  // Sitemap + robots.txt for Google Search Console
  const SITE = "https://thisisme.uk";
  const today = new Date().toISOString().slice(0, 10);
  const pages = ["/", "/work-with-emma", "/hub", "/charity", "/contact", "/privacy"]
    .concat(posts.filter((p) => p.hasPage).map((p) => `/resources/${p.slug}`));
  const urls = pages.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nDisallow: /admin/\nDisallow: /contact-thanks\n\nSitemap: ${SITE}/sitemap.xml\n`);

  console.log(`Built ${posts.length} posts (${posts.filter((p) => p.hasPage).length} article pages, ${featured.length} on the home page).`);
}

build();
