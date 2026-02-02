// ========= 1) PASTE LINK CSV SHEET KAMU DI SINI =========
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRVH3rXKZt6ZIaLB8Sful2N_UPUuyFTGnVCUnkg-LwmuWBuU592Qo86muo6L-PzqkHfwOgHKwUcmKns/pub?gid=0&single=true&output=csv";
// =======================================================

// Opsional: judul & bio (bisa tetap hardcode, atau nanti kita ambil dari sheet)
const PROFILE = {
  title: "Fitroh",
  bio: "Kumpulan link penting",
  avatarLetter: "F",
};

const elLinks = document.getElementById("links");
const elStatus = document.getElementById("status");
document.getElementById("title").textContent = PROFILE.title;
document.getElementById("bio").textContent = PROFILE.bio;
document.getElementById("avatar").textContent = PROFILE.avatarLetter;

/* =========================
   THEME / WARNA TOMBOL
   ========================= */
const THEME_COLORS = {
  whatsapp: "#22c55e",
  instagram: "#e1306c",
  youtube: "#ff0033",
  github: "#111827",
  telegram: "#229ED9",
  tiktok: "#111111",
  facebook: "#1877F2",
  twitter: "#1D9BF0",
  x: "#111111",
  linkedin: "#0A66C2",
  email: "#64748b",
  web: "#7c3aed",
  link: "#7c3aed",
  default: "rgba(255,255,255,.10)",
};

const THEME_GRADIENTS = {
  instagram: "linear-gradient(135deg, #f58529 0%, #dd2a7b 40%, #8134af 75%, #515bd4 100%)",
};

/* =========================
   UTIL
   ========================= */
function safeUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ",") {
      row.push(cur);
      cur = "";
      continue;
    }
    if (!inQuotes && (c === "\n" || c === "\r")) {
      if (c === "\r" && next === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function toBool(v) {
  const s = String(v || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "ya";
}

function toNumber(v, fallback = 9999) {
  const n = Number(String(v || "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function isHexColor(s) {
  const v = String(s || "").trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

function guessTheme({ url, icon, theme }) {
  const t = String(theme || "").trim().toLowerCase();
  if (t) return t;

  const u = String(url || "").toLowerCase();
  const ic = String(icon || "").toLowerCase();

  if (u.includes("wa.me") || u.includes("whatsapp.com") || ic.includes("whatsapp")) return "whatsapp";
  if (u.includes("instagram.com") || ic.includes("instagram")) return "instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be") || ic.includes("youtube")) return "youtube";
  if (u.includes("github.com") || ic.includes("github")) return "github";
  if (u.includes("t.me") || u.includes("telegram") || ic.includes("telegram")) return "telegram";
  if (u.includes("tiktok.com") || ic.includes("tiktok")) return "tiktok";
  if (u.includes("facebook.com") || ic.includes("facebook")) return "facebook";
  if (u.includes("twitter.com") || u.includes("x.com") || ic.includes("twitter") || ic.includes(":x")) return "twitter";
  if (u.includes("linkedin.com") || ic.includes("linkedin")) return "linkedin";
  if (u.startsWith("mailto:") || ic.includes("email") || ic.includes("mail")) return "email";

  return "default";
}

/* =========================
   RENDER
   ========================= */
function applyButtonStyle(a, themeKey, customColor) {
  // default styling
  a.style.background = "";
  a.style.borderColor = "";
  a.style.boxShadow = "";

  // custom hex override
  if (isHexColor(customColor)) {
    a.style.background = `${customColor}22`; // transparan
    a.style.borderColor = `${customColor}55`;
    a.style.boxShadow = `0 10px 28px ${customColor}22`;
    return;
  }

  // gradient for Instagram
  if (themeKey === "instagram") {
    a.style.background = THEME_GRADIENTS.instagram;
    a.style.borderColor = "rgba(255,255,255,.18)";
    a.style.boxShadow = "0 10px 28px rgba(221,42,123,.18)";
    return;
  }

  // themed color (translucent)
  const base = THEME_COLORS[themeKey] || THEME_COLORS.default;
  if (base.startsWith("#")) {
    a.style.background = `${base}22`;
    a.style.borderColor = `${base}55`;
    a.style.boxShadow = `0 10px 28px ${base}22`;
  } else {
    // fallback
    a.style.background = base;
    a.style.borderColor = "rgba(255,255,255,.14)";
  }
}

function renderLinks(items) {
  elLinks.innerHTML = "";

  for (const item of items) {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const themeKey = guessTheme(item);
    applyButtonStyle(a, themeKey, item.color);

    // icon container
    const ico = document.createElement("span");
    ico.className = "ico";

    if (item.icon) {
      const iconSpan = document.createElement("span");
      iconSpan.setAttribute("class", "iconify");
      iconSpan.setAttribute("data-icon", item.icon);
      iconSpan.setAttribute("aria-hidden", "true");
      ico.appendChild(iconSpan);
    } else {
      // placeholder biar layout rapi
      ico.innerHTML = "&nbsp;";
    }

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = item.text;

    a.appendChild(ico);
    a.appendChild(label);
    elLinks.appendChild(a);
  }
}

/* =========================
   LOAD DATA
   ========================= */
async function load() {
  if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PASTE_URL_CSV_DISINI")) {
    elStatus.textContent =
      "Belum di-set. Paste URL CSV Google Sheet di file app.js (SHEET_CSV_URL).";
    return;
  }

  try {
    const url = SHEET_CSV_URL + (SHEET_CSV_URL.includes("?") ? "&" : "?") + "v=" + Date.now();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch gagal: " + res.status);

    const text = await res.text();
    const table = parseCSV(text).filter((r) => r.some((cell) => String(cell).trim() !== ""));
    if (table.length < 2) throw new Error("CSV kosong / header tidak ada.");

    const headers = table[0].map(normalizeHeader);
    const idx = (name) => headers.indexOf(name);

    const iAktif = idx("aktif");
    const iUrutan = idx("urutan");
    const iTeks = idx("teks_tombol");
    const iUrl = idx("url");

    // opsional
    const iIcon = idx("icon");
    const iTheme = idx("theme");
    const iColor = idx("color");

    if ([iAktif, iUrutan, iTeks, iUrl].some((i) => i === -1)) {
      throw new Error("Header kolom tidak sesuai. Wajib: aktif, urutan, teks_tombol, url");
    }

    const items = [];

    for (let r = 1; r < table.length; r++) {
      const row = table[r];

      const aktif = toBool(row[iAktif]);
      if (!aktif) continue;

      const order = toNumber(row[iUrutan], 9999);
      const textBtn = String(row[iTeks] || "").trim();

      const urlRaw = String(row[iUrl] || "").trim();
      const urlSafe = safeUrl(urlRaw);

      if (!textBtn || !urlSafe) continue;

      const icon = iIcon !== -1 ? String(row[iIcon] || "").trim() : "";
      const theme = iTheme !== -1 ? String(row[iTheme] || "").trim() : "";
      const color = iColor !== -1 ? String(row[iColor] || "").trim() : "";

      items.push({ order, text: textBtn, url: urlSafe, icon, theme, color });
    }

    items.sort((a, b) => a.order - b.order);

    if (items.length === 0) {
      elStatus.textContent = "Tidak ada link aktif. Cek kolom aktif/teks_tombol/url.";
      return;
    }

    elStatus.classList.add("hidden");
    renderLinks(items);
  } catch (err) {
    elStatus.textContent = "Gagal memuat. " + (err?.message || String(err));
  }
}

load();

// Opsional: auto refresh tiap 2 menit (biar update sheet cepat)
// setInterval(load, 120 * 1000);
