/* =====================================================================
   Austin Events 2026: app logic (vanilla JS, no dependencies)
   Renders the whole UI into #root, then filters/sorts on interaction.
   ===================================================================== */
(function () {
  "use strict";

  var EVENTS = (window.AUSTIN_EVENTS || []).slice();

  // category -> CSS custom property carrying its hue
  var CAT_VAR = {
    "Music":           "--cat-music",
    "Food & Drink":    "--cat-food",
    "Community":       "--cat-community",
    "Sports":          "--cat-sports",
    "Tech & Business": "--cat-tech",
    "Arts & Culture":  "--cat-arts",
    "Film & Comedy":   "--cat-film"
  };
  var CAT_ORDER = ["Music", "Arts & Culture", "Community", "Food & Drink",
                   "Sports", "Film & Comedy", "Tech & Business"];
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MON_FULL = ["January","February","March","April","May","June","July",
                  "August","September","October","November","December"];

  var THEME_KEY = "austin-events-theme";

  /* ---- icons -------------------------------------------------------- */
  var I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    pin:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    ext:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
    star:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 6 20.4l1.4-6.8L2.3 9l6.9-.7Z"/></svg>',
    sun:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
    moon:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/></svg>',
    info:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6h.01"/></svg>'
  };

  /* ---- helpers ------------------------------------------------------ */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function d(iso) { return new Date(iso + "T00:00:00"); }
  function startMonth(ev) { return d(ev.start).getMonth(); }
  function endMonth(ev) { return ev.end ? d(ev.end).getMonth() : startMonth(ev); }

  function dateBadge(ev) {
    var s = d(ev.start);
    var out = { mon: MON[s.getMonth()], day: s.getDate(), sub: "" };
    if (ev.end && ev.end !== ev.start) {
      var e = d(ev.end);
      var span = Math.round((e - s) / 86400000);
      if (span <= 25) {
        out.sub = (e.getMonth() === s.getMonth())
          ? "–" + e.getDate()
          : "–" + MON[e.getMonth()] + " " + e.getDate();
      }
    }
    return out;
  }

  function pricePill(p) {
    if (p === "Free") return '<span class="pill pill--free">Free</span>';
    return '<span class="pill pill--price">' + esc(p) + "</span>";
  }

  /* ---- shell -------------------------------------------------------- */
  var total = EVENTS.length;
  var freeCount = EVENTS.filter(function (e) { return e.price === "Free"; }).length;
  var featuredCount = EVENTS.filter(function (e) { return e.featured; }).length;
  var catCount = CAT_ORDER.length;

  var catCounts = {};
  CAT_ORDER.forEach(function (c) {
    catCounts[c] = EVENTS.filter(function (e) { return e.category === c; }).length;
  });

  function stat(num, label) {
    return '<div class="stat"><div class="stat__num">' + num +
           '</div><div class="stat__label">' + label + "</div></div>";
  }

  function chip(label, value, dotVar, count, extraClass) {
    return '<button class="chip ' + (extraClass || "") + '" role="button" ' +
      'data-cat="' + esc(value) + '" aria-pressed="false"' +
      (dotVar ? ' style="--dot:var(' + dotVar + ')"' : "") + ">" +
      esc(label) +
      (count != null ? ' <span class="chip__count">' + count + "</span>" : "") +
      "</button>";
  }

  var monthOptions = ['<option value="all">All months</option>'];
  for (var m = 0; m < 12; m++) {
    monthOptions.push('<option value="' + m + '">' + MON_FULL[m] + "</option>");
  }

  var chipsHTML = [chip("All events", "All", null, total, "chip--all")];
  CAT_ORDER.forEach(function (c) {
    chipsHTML.push(chip(c, c, CAT_VAR[c], catCounts[c]));
  });

  var shell =
    '<header class="topbar"><div class="wrap topbar__inner">' +
      '<div class="brand">Austin Events <span class="brand__mark">2026</span></div>' +
      '<button class="theme-toggle" id="themeToggle" type="button"></button>' +
    "</div></header>" +

    '<section class="hero"><div class="wrap hero__inner">' +
      '<p class="eyebrow hero__eyebrow">Live Music Capital of the World &middot; The year ahead</p>' +
      '<h1>A year in Austin, <span class="year">’26</span></h1>' +
      '<div class="hero__rule"></div>' +
      '<p class="hero__lede">Festivals, live music, food, film and the big-ticket weekends. ' +
        'Every marquee event worth planning around this year, in one place.</p>' +
      '<div class="stats">' +
        stat(total, "Events tracked") +
        stat(freeCount, "Free to attend") +
        stat(featuredCount, "Marquee weekends") +
        stat(catCount, "Categories") +
      "</div>" +
    "</div></section>" +

    '<div class="controls"><div class="wrap">' +
      '<div class="controls__row">' +
        '<label class="search">' + I.search +
          '<input id="search" type="search" placeholder="Search events, venues, neighborhoods…" ' +
          'autocomplete="off" aria-label="Search events" /></label>' +
        '<select class="select" id="month" aria-label="Filter by month">' + monthOptions.join("") + "</select>" +
        '<select class="select" id="sort" aria-label="Sort events">' +
          '<option value="date">Soonest first</option>' +
          '<option value="featured">Marquee first</option>' +
        "</select>" +
        '<button class="toggle" id="upcoming" type="button" aria-pressed="true">Upcoming only</button>' +
      "</div>" +
      '<div class="chips" id="chips" role="group" aria-label="Filter by category">' + chipsHTML.join("") + "</div>" +
    "</div></div>" +

    '<main class="wrap" id="main">' +
      '<div class="resultbar"><div class="resultbar__count" id="count"></div></div>' +
      '<div class="grid" id="grid"></div>' +
    "</main>" +

    '<footer class="footer"><div class="wrap footer__inner">' +
      '<p class="footer__note">' + I.info +
        '<span><b>Dates worth double-checking.</b> Confirmed dates are verified against organizers’ ' +
        '2026 announcements. Entries marked <em>typical dates</em> recur every year, so the window shown is ' +
        'the usual one. Confirm with the organizer before you buy tickets or travel. Links go to official ' +
        'event sites (or Visit Austin’s calendar).</span></p>' +
      '<div class="footer__meta">' +
        '<span>Austin Events 2026 &middot; Keep it weird</span>' +
        '<span>Compiled September 2026</span>' +
      "</div>" +
    "</div></footer>";

  var root = document.getElementById("root");
  root.innerHTML = shell;

  /* ---- state + nodes ------------------------------------------------ */
  var state = { search: "", category: "All", month: "all", sort: "date", upcoming: true };
  var grid = document.getElementById("grid");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var monthEl = document.getElementById("month");
  var sortEl = document.getElementById("sort");
  var chipsEl = document.getElementById("chips");
  var firstRender = true;

  /* ---- card --------------------------------------------------------- */
  function cardHTML(ev) {
    var b = dateBadge(ev);
    var catVar = CAT_VAR[ev.category] || "--ink-faint";
    var tbc = ev.dateStatus === "typical"
      ? '<span class="pill pill--tbc">typical dates</span>' : "";
    var star = ev.featured
      ? '<span class="star">' + I.star + " Marquee</span>" : "";
    var src = ev.source
      ? '<span class="pill pill--source">via ' + esc(ev.source) + "</span>" : "";

    return '<article class="card ' + (ev.featured ? "card--featured" : "") +
        '" style="--cat:var(' + catVar + ')">' +
      '<div class="card__date">' +
        '<span class="card__month">' + b.mon + "</span>" +
        '<span class="card__day">' + b.day + "</span>" +
        (b.sub ? '<span class="card__day--range">' + b.sub + "</span>" : "") +
      "</div>" +
      '<div class="card__body">' +
        '<div class="card__toprow">' +
          '<span class="tag">' + esc(ev.category) + "</span>" + star + src +
        "</div>" +
        "<h3>" + esc(ev.title) + "</h3>" +
        '<div class="card__when"><span>' + esc(ev.dateDisplay) + "</span>" + tbc + "</div>" +
        '<p class="card__desc">' + esc(ev.description) + "</p>" +
        '<div class="card__meta">' +
          '<span class="card__venue">' + I.pin + "<span>" + esc(ev.venue) + "</span></span>" +
          pricePill(ev.price) +
        "</div>" +
        '<div class="card__foot">' +
          '<a class="card__link" href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">' +
            "Official site " + I.ext + "</a>" +
          '<span class="card__area">' + esc(ev.area) + "</span>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  /* ---- filter + sort + render -------------------------------------- */
  function currentList() {
    var q = state.search.trim().toLowerCase();
    var list = EVENTS.filter(function (ev) {
      if (state.category !== "All" && ev.category !== state.category) return false;
      if (state.month !== "all") {
        var mm = parseInt(state.month, 10);
        if (mm < startMonth(ev) || mm > endMonth(ev)) return false;
      }
      if (state.upcoming) {
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (d(ev.end || ev.start) < today) return false;
      }
      if (q) {
        var hay = (ev.title + " " + ev.venue + " " + ev.area + " " +
                   ev.category + " " + ev.description).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    list.sort(function (a, bb) {
      if (state.sort === "featured" && a.featured !== bb.featured) {
        return a.featured ? -1 : 1;
      }
      return d(a.start) - d(bb.start);
    });
    return list;
  }

  function render() {
    var list = currentList();

    countEl.innerHTML = "Showing <b>" + list.length + "</b> of " + total + " events";

    if (!list.length) {
      grid.className = "grid";
      grid.innerHTML =
        '<div class="empty" style="grid-column:1/-1">' +
          "<h3>Nothing on the calendar for that</h3>" +
          "<p>Try a different category or month, or clear the filters to see the whole year.</p>" +
          '<button class="btn" id="clearBtn" type="button">Clear filters</button>' +
        "</div>";
      document.getElementById("clearBtn").addEventListener("click", clearFilters);
      return;
    }

    grid.className = "grid" + (firstRender ? " is-enter" : "");
    grid.innerHTML = list.map(cardHTML).join("");
    if (firstRender) {
      firstRender = false;
      setTimeout(function () { grid.classList.remove("is-enter"); }, 700);
    }
  }

  function clearFilters() {
    state = { search: "", category: "All", month: "all", sort: state.sort, upcoming: state.upcoming };
    searchEl.value = "";
    monthEl.value = "all";
    setActiveChip("All");
    render();
    searchEl.focus();
  }

  function setActiveChip(cat) {
    var btns = chipsEl.querySelectorAll(".chip");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-cat") === cat ? "true" : "false");
    }
  }

  /* ---- events ------------------------------------------------------- */
  searchEl.addEventListener("input", function () { state.search = searchEl.value; render(); });
  monthEl.addEventListener("change", function () { state.month = monthEl.value; render(); });
  sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(); });
  chipsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    state.category = btn.getAttribute("data-cat");
    setActiveChip(state.category);
    render();
  });

  var upcomingEl = document.getElementById("upcoming");
  upcomingEl.addEventListener("click", function () {
    state.upcoming = !state.upcoming;
    upcomingEl.setAttribute("aria-pressed", state.upcoming ? "true" : "false");
    render();
  });

  /* ---- theme toggle ------------------------------------------------- */
  var toggleBtn = document.getElementById("themeToggle");
  function effectiveTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function updateToggle() {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    toggleBtn.innerHTML = (next === "dark" ? I.moon : I.sun) +
      "<span>" + (next === "dark" ? "Dark" : "Light") + "</span>";
    toggleBtn.setAttribute("aria-label", "Switch to " + next + " theme");
  }
  toggleBtn.addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    updateToggle();
  });

  // apply any stored preference (also handled inline in <head>, this is a safety net)
  try {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateToggle);
  }

  /* ---- go ----------------------------------------------------------- */
  setActiveChip("All");
  updateToggle();
  render();
})();
