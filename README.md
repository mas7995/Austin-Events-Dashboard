# Austin Events 2026

A single-page dashboard of the Austin events worth planning around in 2026:
festivals, live music, food, film, sports and the big-ticket weekends.
Search, filter by category or month, sort, and click through to each
organizer's official site.

It's a static site. No build step, no framework, no server. Just HTML, CSS
and one data file.

## What's in here

```
index.html          the page shell (fonts, theme, mounts the app)
assets/styles.css    all styling, with light + dark themes
assets/app.js        rendering, search, filters, sort, theme toggle
data/events.js       the event list, the file you'll edit most
favicon.svg          the sunset mark
netlify.toml         Netlify config (publishes the repo root as-is)
```

## Preview it locally

Because everything loads through plain `<script>` tags, you can just open
`index.html` in a browser. If your browser is fussy about local files, run
any static server from the project folder:

```bash
# Python (already on most machines)
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy to Netlify

Two ways, pick one:

**Drag and drop (fastest).** Go to [app.netlify.com/drop](https://app.netlify.com/drop)
and drag this project folder onto the page. You get a live URL in seconds.

**Connect the repo (auto-deploys on every push).** In Netlify, choose
*Add new site, Import an existing project*, pick this GitHub repo, and accept
the defaults. `netlify.toml` already tells Netlify to publish the root folder,
so leave the build command empty and the publish directory as `.`.

Any host that serves static files works too (GitHub Pages, Cloudflare Pages,
Vercel). There is nothing to compile.

## Add or edit an event

Open `data/events.js` and copy one of the blocks in the list. Each event
looks like this:

```js
{
  id: "acl-festival",                 // unique slug
  title: "Austin City Limits Music Festival",
  category: "Music",                  // see the category list below
  start: "2026-10-02",                // YYYY-MM-DD, used for sorting + month filter
  end: "2026-10-11",                  // end date, or null for a single day
  dateDisplay: "October 2–4 & 9–11, 2026",  // the text shown on the card
  dateStatus: "confirmed",            // "confirmed" or "typical" (see below)
  venue: "Zilker Park",
  area: "Zilker",                     // neighborhood / part of town
  price: "$$$",                       // "Free" | "$" | "$$" | "$$$" | "Badge/Pass" | "Varies" | "RSVP"
  featured: true,                     // true adds the "Marquee" badge + accent
  description: "One line about the event.",
  url: "https://www.aclfestival.com/", // official site
  source: "Luma"                      // optional; adds a small "via …" provenance chip
}
```

Save the file and refresh. The stats, category counts and filters all update
themselves from the data, so you never have to touch the code to add an event.

**Categories** (use one of these exact strings so the color and filter match):
`Music`, `Arts & Culture`, `Community`, `Food & Drink`, `Sports`,
`Film & Comedy`, `Tech & Business`.

## About the dates

Austin's calendar is a mix of dates already locked for 2026 and annual events
whose exact 2026 dates may not be published yet.

- `dateStatus: "confirmed"` means the date is verified against the organizer
  or an official 2026 announcement (for example SXSW, ACL Fest, the F1 US
  Grand Prix, the Austin Marathon, the Texas Book Festival, the Trail of
  Lights).
- `dateStatus: "typical"` means the event recurs every year and the window
  shown is its usual one. The card labels these `typical dates`. Always
  confirm with the organizer before buying tickets or booking travel.

This is a planning aid, not a ticketing source. Prices are rough tiers, not
quotes.

## Where the events come from

Two kinds of entries live in `data/events.js`:

- **Curated anchors and festivals**: the marquee weekends and recurring
  annual festivals (SXSW, ACL, F1, LEVITATION, ATX TV Festival, and so on).
- **Newsletter pulls**: individual events lifted from Austin email
  newsletters. These carry a `source` field and show a small "via …" chip on
  the card. Current sources:
  - **Luma**: the weekly "What's happening in Austin" digest.
  - **ABR**: The Austin Business Review, a weekly founder/business roundup.

Newsletters look about a week ahead, so the individual pulls are near-term.
The **Upcoming only** toggle in the filter bar hides anything already past, so
the board stays useful as the year moves.

## Keeping it updated

Today this is a snapshot: events refresh whenever the data file is edited.
Two ways to keep it current:

1. **Manual**: edit `data/events.js` and redeploy. If you connected the repo
   to Netlify, a push auto-deploys.
2. **Automated**: a scheduled job can re-read the source newsletters on a
   cadence (for example, every Monday), extract new events, update
   `data/events.js`, and push, which triggers a fresh Netlify deploy. That is
   a separate setup step, not wired in yet.
