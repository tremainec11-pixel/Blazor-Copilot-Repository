// Sample data: replace later with an API fetch if needed.
const SAMPLE_EVENTS = [
  {
    id: "evt-001",
    name: "Paseo Nocturno Navideño",
    date: "2025-12-20",
    location: "Ciudad de México",
  },
  {
    id: "evt-002",
    name: "Quimeras Modernistas: Mario Pani y Guillermo Zamora",
    date: "2025-12-23",
    location: "Cuauhtémoc, CDMX",
  },
  {
    id: "evt-003",
    name: "New Year’s Eve Rooftop Gala",
    date: "2025-12-31",
    location: "Centro Histórico, CDMX",
  },
  {
    id: "evt-004",
    name: "Electronic NYE Party: TORT x Xelva",
    date: "2025-12-31",
    location: "Roma Norte, CDMX",
  },
  {
    id: "evt-005",
    name: "Family Fireworks Viewing",
    date: "2025-12-31",
    location: "Reforma, CDMX",
  },
  {
    id: "evt-006",
    name: "Art Walk: Winter Edition",
    date: "2026-01-04",
    location: "Coyoacán, CDMX",
  }
];

// State
let state = {
  query: "",
  location: "",
  startDate: "",
  endDate: "",
  sort: "date-asc",
  events: SAMPLE_EVENTS
};

// Elements
const elSearch = document.getElementById("search");
const elLocation = document.getElementById("location");
const elStart = document.getElementById("startDate");
const elEnd = document.getElementById("endDate");
const elSort = document.getElementById("sort");
const elClear = document.getElementById("clearFilters");
const elResetEmpty = document.getElementById("resetFromEmpty");
const grid = document.getElementById("eventsGrid");
const summary = document.getElementById("resultsSummary");
const emptyState = document.getElementById("emptyState");

// Initialize
init();

function init() {
  // Populate locations from data
  const uniqueLocations = Array.from(
    new Set(state.events.map(e => e.location))
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  uniqueLocations.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc;
    opt.textContent = loc;
    elLocation.appendChild(opt);
  });

  // Wire up events
  elSearch.addEventListener("input", onChange);
  elLocation.addEventListener("change", onChange);
  elStart.addEventListener("change", onChange);
  elEnd.addEventListener("change", onChange);
  elSort.addEventListener("change", onChange);
  elClear.addEventListener("click", () => {
    resetFilters();
    render();
  });
  elResetEmpty.addEventListener("click", () => {
    resetFilters();
    render();
  });

  // Pre-fill dates to a sensible window (this month)
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  elStart.value = toInputDate(startOfMonth);
  elEnd.value = toInputDate(endOfMonth);
  state.startDate = elStart.value;
  state.endDate = elEnd.value;

  render();
}

function onChange() {
  state.query = elSearch.value.trim();
  state.location = elLocation.value;
  state.startDate = elStart.value;
  state.endDate = elEnd.value;
  state.sort = elSort.value;
  render();
}

function resetFilters() {
  elSearch.value = "";
  elLocation.value = "";
  elStart.value = "";
  elEnd.value = "";
  elSort.value = "date-asc";

  state = {
    ...state,
    query: "",
    location: "",
    startDate: "",
    endDate: "",
    sort: "date-asc"
  };
}

function render() {
  const filtered = applyFilters(state.events, {
    query: state.query,
    location: state.location,
    startDate: state.startDate,
    endDate: state.endDate
  });
  const sorted = applySort(filtered, state.sort);

  grid.innerHTML = "";
  summary.textContent = buildSummary(sorted.length);

  if (sorted.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  for (const e of sorted) {
    grid.appendChild(renderCard(e));
  }
}

function applyFilters(events, { query, location, startDate, endDate }) {
  const q = query?.toLowerCase() || "";

  return events.filter(e => {
    const matchesQuery = q ? e.name.toLowerCase().includes(q) : true;
    const matchesLocation = location ? e.location === location : true;
    const eventDate = new Date(e.date);

    const matchesStart = startDate ? eventDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? eventDate <= new Date(endDate) : true;

    return matchesQuery && matchesLocation && matchesStart && matchesEnd;
  });
}

function applySort(events, sortKey) {
  const byDateAsc = (a, b) => new Date(a.date) - new Date(b.date);
  const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
  const byNameAsc = (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  const byNameDesc = (a, b) =>
    b.name.localeCompare(a.name, undefined, { sensitivity: "base" });

  const sorters = {
    "date-asc": byDateAsc,
    "date-desc": byDateDesc,
    "name-asc": byNameAsc,
    "name-desc": byNameDesc
  };

  const sorter = sorters[sortKey] || byDateAsc;
  return [...events].sort(sorter);
}

function renderCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";
  const title = document.createElement("h3");
  title.textContent = event.name;

  const meta = document.createElement("div");
  meta.className = "event-meta";

  const datePill = pill(formatDate(event.date));
  const locPill = pill(event.location);

  meta.append(datePill, locPill);

  card.append(title, meta);
  return card;
}

function pill(text) {
  const el = document.createElement("span");
  el.className = "pill";
  el.textContent = text;
  return el;
}

function formatDate(iso) {
  const d = new Date(iso);
  const opts = { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat(undefined, opts).format(d);
}

function toInputDate(d) {
  // yyyy-mm-dd for <input type="date">
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
