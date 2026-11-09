"use strict";

const RESUME_FILES = { demo: "data/demo.json" };
const selectedResume = new URLSearchParams(location.search).get("resume") || "demo";
const DATA_PATH = RESUME_FILES[selectedResume] || RESUME_FILES.demo;

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character]));

const link = (label, href) => href
  ? `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
  : escapeHtml(label);

function sideList(title, items, formatter = escapeHtml) {
  if (!items?.length) return "";
  return `<section class="side-section"><h2 class="side-heading">${escapeHtml(title)}</h2><ul class="plain-list">${items.map(item => `<li>${formatter(item)}</li>`).join("")}</ul></section>`;
}

function tags(title, items) {
  if (!items?.length) return "";
  return `<section class="side-section"><h2 class="side-heading">${escapeHtml(title)}</h2><ul class="tag-list">${items.map(item => `<li class="tag">${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function sidebarEducation(items, title = "Education") {
  if (!items?.length) return "";
  return `<section class="side-section"><h2 class="side-heading">${escapeHtml(title)}</h2><ul class="plain-list">${items.map(item => `<li><strong>${escapeHtml(item.degree)}</strong><span class="education-detail">${escapeHtml(item.institution)}</span><span class="education-detail">${escapeHtml(item.period)}</span></li>`).join("")}</ul></section>`;
}

function entry(item) {
  const bullets = item.highlights?.length ? `<ul>${item.highlights.map(text => `<li>${escapeHtml(text)}</li>`).join("")}</ul>` : "";
  const history = item.history?.length
    ? `<div class="history-list">${item.history.map(row => `<div class="history-row"><div><strong>${escapeHtml(row.company)}</strong><span>${escapeHtml(row.role)}</span></div><span class="history-period">${escapeHtml(row.period)}</span></div>`).join("")}</div>`
    : "";
  const title = item.role || item.degree || item.name;
  const subtitle = item.companies?.length
    ? item.companies.map(escapeHtml).join("<br>")
    : escapeHtml(item.company || item.institution || item.type || "");
  return `<article class="entry${item.compact ? " entry-compact" : ""}"><header class="entry-header"><div><h3 class="entry-title">${escapeHtml(title)}</h3><p class="entry-subtitle">${subtitle}${item.location ? ` · ${escapeHtml(item.location)}` : ""}</p></div><div class="entry-meta">${escapeHtml(item.period)}</div></header>${bullets}${history}</article>`;
}

function educationEntry(item, compact = false) {
  if (!compact) return entry(item);
  return `<article class="entry"><h3 class="entry-title">${escapeHtml(item.degree)}</h3><p class="entry-subtitle">${escapeHtml(item.institution)} (${escapeHtml(item.period)})</p></article>`;
}

function section(title, content, className = "") {
  if (!content) return "";
  return `<section class="section ${className}"><h2 class="section-heading">${escapeHtml(title)}</h2>${content}</section>`;
}

function relevanceScore(item) {
  if (Number.isFinite(item.priority)) return item.priority;
  const text = `${item.category || ""} ${item.role || ""} ${item.company || ""}`.toLowerCase();
  if (/customer support|customer service|customer success|technical support/.test(text)) return 100;
  if (/hospitality|hotel|restaurant|bar|cafe|waiter|server/.test(text)) return 10;
  return 50;
}

function byRelevance(items = []) {
  return items.map((item, index) => ({ item, index }))
    .sort((a, b) => relevanceScore(b.item) - relevanceScore(a.item) || a.index - b.index)
    .map(({ item }) => item);
}

function isCustomerSupport(item) {
  const text = `${item.category || ""} ${item.role || ""}`.toLowerCase();
  return /customer support|customer service|customer success|technical support/.test(text);
}

function isHospitality(item) {
  const text = `${item.category || ""} ${item.role || ""} ${item.company || ""}`.toLowerCase();
  return /hospitality|hotel|restaurant|bar|cafe|café|waiter|waitress|server|bartender|hostess|chef|kitchen/.test(text);
}

function splitName(name) {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length < 2) return `<span>${escapeHtml(name)}</span>`;
  const lastName = parts.pop();
  return `<span>${escapeHtml(parts.join(" "))}</span><span>${escapeHtml(lastName)}</span>`;
}

function render(data) {
  const labels = data.labels || {};
  document.title = `${data.basics.name} — ${data.basics.title}`;
  document.documentElement.lang = data.locale || "en";
  const resumeElement = document.getElementById("resume");
  resumeElement.dataset.profile = selectedResume;
  const contacts = data.basics.contact.map(item => `<strong>${escapeHtml(item.label)}</strong>${link(item.value, item.href)}`);
  const languages = data.languages.map(item => data.displayOptions?.compactLanguages
    ? `${escapeHtml(item.name)} — ${escapeHtml(item.level)}`
    : `<strong>${escapeHtml(item.name)}</strong>${escapeHtml(item.level)}`);
  const certificationBlock = data.certifications?.length
    ? sideList(labels.certifications || "Certifications", data.certifications)
    : "";
  const promotedSupport = (data.additionalExperience || []).filter(isCustomerSupport);
  const combinedExperience = [...(data.experience || []), ...promotedSupport];
  const professionalExperience = data.displayOptions?.preserveExperienceOrder
    ? combinedExperience
    : byRelevance(combinedExperience);
  const additionalExperience = byRelevance((data.additionalExperience || []).filter(item => !isCustomerSupport(item)));
  const showAdditionalExperience = data.displayOptions?.showAdditionalExperience
    ?? (additionalExperience.length > 0 && !additionalExperience.every(isHospitality));

  resumeElement.innerHTML = `
    <aside class="sidebar">
      <header class="identity"><h1 class="name">${splitName(data.basics.name)}</h1><p class="title">${escapeHtml(data.basics.title)}</p></header>
      ${sideList(labels.contact || "Contact", contacts, value => value)}
      ${sideList(labels.languages || "Languages", languages, value => value)}
      ${tags(labels.skills || "Skills", data.skills)}
      ${tags(labels.software || "Software", data.software)}
      ${data.displayOptions?.educationInSidebar ? sidebarEducation(data.education, labels.education || "Education") : ""}
      ${certificationBlock}
    </aside>
    <div class="content">
      ${section(labels.summary || "Professional Summary", `<p class="summary">${escapeHtml(data.summary)}</p>`)}
      ${section(labels.projects || "Projects", (data.projects || []).map(entry).join(""), "projects")}
      ${section(labels.experience || "Professional Experience", professionalExperience.map(entry).join(""))}
      ${data.displayOptions?.educationInSidebar ? "" : section(labels.education || "Education", data.education.map(item => educationEntry(item, data.displayOptions?.compactEducation)).join(""))}
      ${showAdditionalExperience ? section(labels.additionalExperience || "Additional Experience", additionalExperience.map(entry).join(""), "additional-experience") : ""}
    </div>`;

  prepareSinglePagePrint();
}

function prepareSinglePagePrint() {
  // Print behavior is deterministic in CSS: Additional Experience never
  // participates in the A4 layout, preserving every support role and education.
}

async function loadData() {
  if (location.protocol !== "file:") {
    const response = await fetch(DATA_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load résumé data (${response.status}).`);
    return response.json();
  }

  // Chrome restricts fetch() on file:// pages. A same-directory iframe keeps
  // the JSON as the single source of truth while preserving double-click use.
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.hidden = true;
    frame.src = DATA_PATH;
    frame.onload = () => {
      try {
        const text = frame.contentDocument.body.textContent;
        resolve(JSON.parse(text));
      } catch (error) { reject(error); }
      finally { frame.remove(); }
    };
    frame.onerror = reject;
    document.body.appendChild(frame);
  });
}

loadData().then(render).catch(error => {
  console.error(error);
  document.getElementById("resume").innerHTML = `<div class="loading">The résumé data could not be loaded. Open this folder in Chrome and ensure <strong>${DATA_PATH}</strong> is present.</div>`;
});
