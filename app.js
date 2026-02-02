// ========= 1) PASTE LINK CSV SHEET KAMU DI SINI =========
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRVH3rXKZt6ZIaLB8Sful2N_UPUuyFTGnVCUnkg-LwmuWBuU592Qo86muo6L-PzqkHfwOgHKwUcmKns/pub?gid=0&single=true&output=csv";
// contoh: https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv
// =======================================================

// Opsional: judul & bio (kalau mau ambil dari sheet juga bisa, tapi dibuat simpel dulu)
const PROFILE = {
  title: "Fitroh",
  bio: "Kumpulan link penting",
  avatarLetter: "F"
};

const elLinks = document.getElementById("links");
const elStatus = document.getElementById("status");
document.getElementById("title").textContent = PROFILE.title;
document.getElementById("bio").textContent = PROFILE.bio;
document.getElementById("avatar").textContent = PROFILE.avatarLetter;

function safeUrl(url) {
  try {
    const u = new URL(url);
    // hanya izinkan http(s)
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

// CSV parser sederhana yang cukup robust (handle quoted fields)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cur += '"'; // escaped quote
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (c === ",")) {
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
  // last cell
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

function renderLinks(items) {
  elLinks.innerHTML = "";
  for (const item of items) {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = item.text;
    elLinks.appendChild(a);
  }
}

async function load() {
  if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PASTE_URL_CSV_DISINI")) {
    elStatus.textContent =
      "Belum di-set. Paste URL CSV Google Sheet di file app.js (SHEET_CSV_URL).";
    return;
  }

  try {
    // cache bust biar update cepat
    const res = await fetch(SHEET_CSV_URL + (SHEET_CSV_URL.includes("?") ? "&" : "?") + "v=" + Date.now(), {
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Fetch gagal: " + res.status);

    const text = await res.text();
    const table = parseCSV(text).filter(r => r.some(cell => String(cell).trim() !== ""));
    if (table.length < 2) throw new Error("CSV kosong / header tidak ada.");

    const headers = table[0].map(normalizeHeader);
    const idx = (name) => headers.indexOf(name);

    const iAktif = idx("aktif");
    const iUrutan = idx("urutan");
    const iTeks = idx("teks_tombol");
    const iUrl = idx("url");

    if ([iAktif, iUrutan, iTeks, iUrl].some(i => i === -1)) {
      throw new Error("Header kolom tidak sesuai. Wajib: aktif, urutan, teks_tombol, url");
    }

    const items = [];
    for (let r = 1; r < table.length; r++) {
      const row = table[r];
      const aktif = toBool(row[iAktif]);
      const urutan = toNumber(row[iUrutan], 9999);
      const textBtn = String(row[iTeks] || "").trim();
      const urlRaw = String(row[iUrl] || "").trim();
      const url = safeUrl(urlRaw);

      if (!aktif) continue;
      if (!textBtn || !url) continue;

      items.push({ order: urutan, text: textBtn, url });
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
