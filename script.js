// ─────────────────────────────────────────
//  SKYE Weather — by Saadia
// ─────────────────────────────────────────

const API_KEY = "06567c1944ff1b7f2fbb625c33f496b3";
const BASE    = "https://api.openweathermap.org/data/2.5/weather";

// DOM refs
const cityInput   = document.getElementById("cityInput");
const searchBtn   = document.getElementById("searchBtn");
const clearBtn    = document.getElementById("clearBtn");
const locationBtn = document.getElementById("locationBtn");
const themeToggle = document.getElementById("themeToggle");
const loader      = document.getElementById("loader");
const errorCard   = document.getElementById("errorCard");
const errorMsg    = document.getElementById("errorMsg");
const retryBtn    = document.getElementById("retryBtn");
const weatherCard = document.getElementById("weatherCard");
const skyBg       = document.getElementById("skyBg");
const starField   = document.getElementById("starField");
const prayerBtn   = document.getElementById("prayerBtn");
const prayerCard  = document.getElementById("prayerCard");
const prayerClose = document.getElementById("prayerClose");

// ── Default: LIGHT mode ───────────────────
// Only use saved preference if user has explicitly set it before
const savedTheme = localStorage.getItem("skye-theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

// ── Stars ─────────────────────────────────
function makeStars(n = 90) {
  starField.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const sz = Math.random() * 2.5 + .5;
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;animation-duration:${1.5+Math.random()*3}s;animation-delay:${Math.random()*4}s`;
    starField.appendChild(s);
  }
}
makeStars();

// ── Theme toggle ──────────────────────────
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("skye-theme", next);
  if (lastCondition) applySky(lastCondition);
});

// ── Clear button ──────────────────────────
cityInput.addEventListener("input", () => {
  clearBtn.classList.toggle("show", cityInput.value.length > 0);
});
clearBtn.addEventListener("click", () => {
  cityInput.value = "";
  clearBtn.classList.remove("show");
  cityInput.focus();
});

// ── Search ────────────────────────────────
searchBtn.addEventListener("click", doSearch);
cityInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
retryBtn.addEventListener("click",  () => { cityInput.focus(); hideAll(); });

function doSearch() {
  const city = cityInput.value.trim();
  if (!city) { cityInput.focus(); return; }
  fetchByCity(city);
}

// ── Geolocation ───────────────────────────
locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showError("Geolocation not supported.");
  showLoader();
  navigator.geolocation.getCurrentPosition(
    p => fetchByCoords(p.coords.latitude, p.coords.longitude),
    () => showError("Location access denied.")
  );
});

// ── Weather API ───────────────────────────
async function fetchByCity(city) {
  showLoader();
  try {
    const r = await fetch(`${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    const d = await r.json();
    if (d.cod !== 200) throw new Error(d.message || "City not found");
    render(d);
    localStorage.setItem("skye-last", city);
    // Save coords for prayer times
    localStorage.setItem("skye-lat", d.coord.lat);
    localStorage.setItem("skye-lon", d.coord.lon);
    localStorage.setItem("skye-city-name", d.name + ", " + d.sys.country);
  } catch (e) {
    showError(cap(e.message) || "City not found. Try again.");
  }
}

async function fetchByCoords(lat, lon) {
  try {
    const r = await fetch(`${BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const d = await r.json();
    if (d.cod !== 200) throw new Error(d.message);
    render(d);
    localStorage.setItem("skye-lat", lat);
    localStorage.setItem("skye-lon", lon);
    localStorage.setItem("skye-city-name", d.name + ", " + d.sys.country);
  } catch (e) {
    showError("Could not fetch weather for your location.");
  }
}

// ── Render weather ────────────────────────
let lastCondition = null;

function render(d) {
  const {
    name, sys:{ country, sunrise, sunset },
    main:{ temp, feels_like, humidity, pressure },
    weather:[{ description, icon, main: cond }],
    wind:{ speed }, visibility
  } = d;

  document.getElementById("cityName").textContent    = name;
  document.getElementById("countryDate").textContent = `${country} · ${fmtDate(new Date())}`;
  document.getElementById("temp").textContent        = `${Math.round(temp)}°`;
  document.getElementById("feelsLike").textContent   = `${Math.round(feels_like)}°C`;
  document.getElementById("condition").textContent   = cap(description);

  const img = document.getElementById("weatherIcon");
  img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  img.alt = description;

  document.getElementById("humidity").textContent   = `${humidity}%`;
  document.getElementById("wind").textContent       = `${speed} m/s`;
  document.getElementById("visibility").textContent = visibility ? `${(visibility/1000).toFixed(1)} km` : "N/A";
  document.getElementById("pressure").textContent   = `${pressure} hPa`;
  document.getElementById("sunrise").textContent    = fmtTime(sunrise);
  document.getElementById("sunset").textContent     = fmtTime(sunset);

  setTimeout(() => {
    document.getElementById("humidityBar").style.width = `${humidity}%`;
    document.getElementById("windBar").style.width     = `${Math.min(speed * 5, 100)}%`;
  }, 300);

  positionSunDot(sunrise, sunset);

  cityInput.value = "";
  clearBtn.classList.remove("show");

  lastCondition = cond;
  applySky(cond);
  showCard();
}

// ── Sun arc dot ───────────────────────────
function positionSunDot(rise, set) {
  const now  = Date.now() / 1000;
  const dot  = document.getElementById("sunDot");
  if (!dot) return;
  const t = Math.max(0, Math.min(1, (now - rise) / (set - rise)));
  const x = (1-t)*(1-t)*4 + 2*(1-t)*t*40 + t*t*76;
  const y = (1-t)*(1-t)*36 + 2*(1-t)*t*4  + t*t*36;
  dot.setAttribute("cx", x.toFixed(1));
  dot.setAttribute("cy", y.toFixed(1));
}

// ── Sky colours ───────────────────────────
const SKY = {
  Clear:        { dark:["#0d0627","#1e0f5c","#2e1b8e"],  light:["#7dd3fc","#93c5fd","#dbeafe"] },
  Clouds:       { dark:["#151520","#252535","#303050"],   light:["#c7c9d9","#d8dae8","#e8eaf0"] },
  Rain:         { dark:["#080e1a","#102038","#153050"],   light:["#90b8d8","#a8cce0","#c0daea"] },
  Drizzle:      { dark:["#0a1220","#142535","#1a3045"],   light:["#a8d8e8","#b8e0f0","#cce8f5"] },
  Thunderstorm: { dark:["#080810","#141020","#200a30"],   light:["#505060","#686878","#808090"] },
  Snow:         { dark:["#101828","#183050","#204870"],   light:["#ddeeff","#eef4ff","#f5f8ff"] },
  Mist:         { dark:["#141822","#1e2535","#252e40"],   light:["#d0d4dc","#dce0e8","#e8ecf0"] },
  Haze:         { dark:["#18140c","#2a2010","#382c18"],   light:["#e8dcc8","#f0e8d5","#f5f0e5"] },
  default:      { dark:["#1a103c","#2d1b69","#4a1d96"],   light:["#c4b5fd","#f0abfc","#fda4af"] },
};

function applySky(cond) {
  const theme = document.documentElement.getAttribute("data-theme");
  const map   = SKY[cond] || SKY.default;
  const [a,b,c] = map[theme];
  skyBg.style.background = `linear-gradient(150deg,${a} 0%,${b} 55%,${c} 100%)`;
}

// ════════════════════════════════════════════
//  PRAYER TIMES
// ════════════════════════════════════════════

const PRAYERS = [
  { key:"Fajr",    name:"Fajr",    arabic:"فجر",    icon:"🌙" },
  { key:"Sunrise", name:"Sunrise", arabic:"طلوع",   icon:"🌅", skip:true },
  { key:"Dhuhr",   name:"Dhuhr",   arabic:"ظہر",    icon:"☀️" },
  { key:"Asr",     name:"Asr",     arabic:"عصر",    icon:"🌤" },
  { key:"Maghrib", name:"Maghrib", arabic:"مغرب",   icon:"🌇" },
  { key:"Isha",    name:"Isha",    arabic:"عشاء",   icon:"🌃" },
];

// ── Prayer button click ────────────────────
prayerBtn.addEventListener("click", () => {
  // If prayer card is already open, close it
  if (prayerCard.classList.contains("active")) {
    prayerCard.classList.remove("active");
    return;
  }
  
  // Open prayer card
  openPrayerCard();
  
  // Scroll down to prayer card after a small delay
  setTimeout(() => {
    prayerCard.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest'
    });
  }, 100);
});

prayerClose.addEventListener("click", () => {
  prayerCard.classList.remove("active");
});

async function openPrayerCard() {
  prayerCard.classList.add("active");
  document.getElementById("prayerList").innerHTML = '<div class="p-loader"><div class="orbit-ring"></div></div>';
  document.getElementById("prayerLocation").textContent = "Detecting…";
  document.getElementById("prayerNext").textContent = "—";

  // Try to use coords from last weather search, else ask geolocation
  let lat = localStorage.getItem("skye-lat");
  let lon = localStorage.getItem("skye-lon");
  let cityLabel = localStorage.getItem("skye-city-name") || "Your Location";

  if (!lat || !lon) {
    // Try geolocation
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {timeout:8000})
      );
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
      cityLabel = "Current Location";
      // Reverse geocode via OWM
      try {
        const gr = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        const gd = await gr.json();
        if (gd[0]) cityLabel = gd[0].name + ", " + gd[0].country;
      } catch(_) {}
    } catch(e) {
      document.getElementById("prayerList").innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-dim)">⚠️ Please search a city first<br>or allow location access.</div>`;
      return;
    }
  }

  document.getElementById("prayerLocation").textContent = cityLabel;

  // AlAdhan API — free, no key needed
  const today = new Date();
  const dd = String(today.getDate()).padStart(2,"0");
  const mm = String(today.getMonth()+1).padStart(2,"0");
  const yyyy = today.getFullYear();

  document.getElementById("prayerDate").textContent =
    today.toLocaleDateString("en-US", {weekday:"long", day:"numeric", month:"long", year:"numeric"});

  try {
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=1&school=1`;
    const r = await fetch(url);
    const d = await r.json();

    if (d.code !== 200) throw new Error("Prayer API failed");

    const timings = d.data.timings;
    renderPrayerList(timings, today);

  } catch(e) {
    document.getElementById("prayerList").innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-dim)">⚠️ Could not fetch prayer times.<br>Check your internet connection.</div>`;
  }
}

function renderPrayerList(timings, today) {
  const nowMins = today.getHours() * 60 + today.getMinutes();

  // Build list of prayers with minutes-of-day
  const items = PRAYERS.filter(p => !p.skip).map(p => {
    const raw = timings[p.key]; // "05:23"
    const [h, m] = raw.split(":").map(Number);
    const totalMins = h * 60 + m;
    return { ...p, raw, totalMins };
  });

  // Find current (passed most recently) and next
  let currentIdx = -1;
  let nextIdx    = -1;

  for (let i = 0; i < items.length; i++) {
    if (items[i].totalMins <= nowMins) currentIdx = i;
  }
  nextIdx = currentIdx + 1 < items.length ? currentIdx + 1 : -1; // -1 = Fajr tomorrow

  let nextLabel = "—";
  if (nextIdx >= 0) {
    nextLabel = `${items[nextIdx].name} at ${fmt12(items[nextIdx].raw)}`;
  } else {
    nextLabel = `Fajr (tomorrow) at ${fmt12(items[0].raw)}`;
  }
  document.getElementById("prayerNext").textContent = nextLabel;

  let html = "";
  items.forEach((p, i) => {
    let cls = "";
    let badge = "";
    if (i === currentIdx) {
      cls = "current";
      badge = `<div class="p-badge">Current</div>`;
    } else if (i === nextIdx) {
      badge = `<div class="p-badge next-badge">Next</div>`;
    } else if (i < currentIdx) {
      cls = "passed";
    }

    html += `
      <div class="prayer-item ${cls}" style="animation-delay:${i*0.06}s">
        <div class="p-left">
          <span class="p-icon">${p.icon}</span>
          <div>
            <div class="p-name">${p.name}</div>
            <div class="p-arabic">${p.arabic}</div>
          </div>
        </div>
        <div class="p-right">
          <div class="p-time">${fmt12(p.raw)}</div>
          ${badge}
        </div>
      </div>`;
  });

  document.getElementById("prayerList").innerHTML = html;
}

// Convert "05:23" → "5:23 AM"
function fmt12(raw) {
  const [h, m] = raw.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}

// ── UI state ──────────────────────────────
function showLoader() { 
  hideAll(); 
  loader.classList.add("active"); 
  prayerCard.classList.remove("active");
}
function showError(m) { 
  hideAll(); 
  errorMsg.textContent = m; 
  errorCard.classList.add("active"); 
  prayerCard.classList.remove("active");
}
function showCard() {
  hideAll(); 
  weatherCard.classList.add("active");
  prayerCard.classList.remove("active");
}
function hideAll() {
  loader.classList.remove("active");
  errorCard.classList.remove("active");
  weatherCard.classList.remove("active");
}

// ── Helpers ───────────────────────────────
const cap      = s => s ? s[0].toUpperCase() + s.slice(1) : "";
const fmtDate  = d => d.toLocaleDateString("en-US",{weekday:"short",day:"numeric",month:"short"});
const fmtTime  = u => new Date(u*1000).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true});

// ── Auto-load last city ───────────────────
const last = localStorage.getItem("skye-last");
if (last) fetchByCity(last);
