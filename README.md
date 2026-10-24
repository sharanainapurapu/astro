# Jyotish · Vedic Astrology

A fully static Vedic astrology (Jyotish) web app. It computes a sidereal birth
chart, Vimshottari dasha periods, and planetary transits **entirely in your
browser**, then interprets them using a bundled knowledge base of principles
paraphrased from public-domain classical texts — each with a source citation.

No backend, no API keys, no data ever leaves the device. It is designed to be
hosted for free on **GitHub Pages**.

## Features

- **Sidereal birth chart (Rashi / D1)** using the Lahiri (Chitrapaksha)
  ayanamsa, rendered as a North Indian style diagram.
- **Full planetary table**: sign, degree, nakshatra & pada, house, retrograde
  status, and dignity (exalted / debilitated / own sign).
- **Vimshottari dasha**: the 120-year Mahadasha / Antardasha timeline computed
  from the natal Moon's nakshatra, with the currently-active period highlighted.
- **Date-range forecast**: pick any span of time to see which dasha periods,
  Jupiter/Saturn transits (Gochara), and **Sade Sati** phases are active, with
  classical interpretations.
- **Ask the Classics**: free-text search over the knowledge base.
- Works for any birth date, time and place. 20 cities are bundled; you can also
  enter latitude / longitude and an IANA timezone manually.

## Using the app — a complete guide

This section is a hands-on walkthrough: what each field means, four worked
examples you can type in verbatim, how to read every tab, and — just as
important — the ways the app is **not** meant to be used.

### 1. Entering birth details

The form has three inputs, plus an optional manual-coordinates mode.

| Field | What to enter | Why it matters |
| --- | --- | --- |
| **Date of birth** | The calendar date at the place of birth | Sets the day's planetary positions |
| **Time of birth (24h, local)** | Local clock time at the birthplace, e.g. `14:30`, **not** your current timezone | Drives the ascendant and the Moon's exact degree, which fixes the dasha |
| **Place of birth** | Pick a bundled city, or tick "Enter latitude/longitude manually" | Sets latitude/longitude (for the ascendant) and timezone (to convert to UTC) |

Two rules that matter most for accuracy:

- **Use the local wall-clock time at the birthplace.** If someone was born in
  Mumbai at 2:30 PM, enter `14:30` and pick *Mumbai* — do not convert to your
  own timezone first. The app does the timezone math for you.
- **Birth time changes the chart a lot.** The ascendant moves roughly one sign
  every two hours, and the Moon moves about 12–13° per day. An unknown or
  rounded birth time makes the ascendant, the houses, and the dasha start date
  unreliable. If you only know "sometime in the morning," treat the house
  placements and dasha dates as rough.

#### Manual coordinates

Tick the checkbox to enter latitude, longitude and an IANA timezone directly —
useful for a town that isn't in the bundled list.

- **Latitude**: degrees, **north positive** (so southern-hemisphere places are
  negative, e.g. Sydney is `-33.8688`).
- **Longitude**: degrees, **east positive** (so the Americas are negative, e.g.
  New York is `-74.0060`).
- **Timezone**: an IANA name like `Asia/Kolkata`, `Europe/London`,
  `America/New_York`. Not an offset like "GMT+5:30" and not an abbreviation like
  "IST" — the app validates this and will warn you if it's unknown.

### 2. Worked examples

Type these in exactly to see each kind of result.

#### Example A — a bundled Indian city

```
Date:  1990-05-15
Time:  14:30
Place: Mumbai, India
```

Expected: an ascendant in the afternoon range for that date, a full planet
table, and a Vimshottari timeline beginning with a partial period. Open the
**Chart** tab to see the diagram and the "current period" line.

#### Example B — Western birth, DST in effect

```
Date:  2000-07-04
Time:  09:15
Place: New York, USA
```

July is daylight-saving time in New York (UTC−4). The app applies that
automatically — you still just type the local `09:15`. (A January birth would
use UTC−5; you don't change anything, the app does.)

#### Example C — manual coordinates, unusual offset

```
Tick "Enter latitude/longitude manually"
Date:      1995-03-10
Time:      06:00
Latitude:  27.7172
Longitude: 85.3240
Timezone:  Asia/Kathmandu
```

Kathmandu runs at UTC+5:45 — an offset many tools get wrong. This app handles
the 45-minute offset correctly.

#### Example D — southern hemisphere

```
Tick "Enter latitude/longitude manually"
Date:      1988-11-20
Time:      22:45
Latitude:  -33.8688
Longitude: 151.2093
Timezone:  Australia/Sydney
```

Negative latitude (south) and a large positive longitude (east). The ascendant
calculation accounts for the observer's latitude, so southern births work the
same way.

### 3. Reading each tab

- **Chart** — the North Indian diagram plus the planet table. Sign numbers
  (1 = Aries … 12 = Pisces) sit in each house box; planet abbreviations
  (Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke) show where each planet falls. Tags mark
  **exalted**, **debilitated**, **own-sign**, and **R** for retrograde. The
  "current period" line shows today's running Mahadasha / Antardasha.
- **Predictions** — natal interpretations matched to features of the chart:
  planet-in-house, exaltation/debilitation, the Moon's birth-star (nakshatra),
  and any detected yogas (e.g. Gajakesari). Every passage ends with its source
  citation.
- **Date range** — pick a **From** and **To** date to see which dasha periods
  run in that window, which Jupiter/Saturn sign-changes (Gochara) occur and in
  which house from the natal Moon, and any **Sade Sati** phase, each with a
  classical interpretation. Good for questions like "what's active for me over
  the next three years?"
- **Ask** — free-text search over the knowledge base. Try
  `Jupiter in the 9th house`, `Saturn mahadasha`, `Rohini nakshatra`,
  `Gajakesari yoga`. It matches keywords, so phrase queries around planets,
  houses, signs, nakshatras, dashas and yogas.

### 4. Tips for good results

- **Get the birth time as exact as you can** — a birth certificate is ideal.
- **Pick the nearest city** if the exact town isn't listed; a few kilometres
  barely moves the chart. For precision, use manual coordinates.
- **Use IANA timezone names** in manual mode, and pick the one that was in force
  at the *place* of birth.
- **The knowledge base is curated, not exhaustive.** If a specific
  planet-in-house combination has no entry, the Predictions tab simply won't
  show a passage for it — that's expected. Use the **Ask** tab to explore
  related principles, and see "Expanding the knowledge base" below to add more.

### 5. How *not* to use it

Please read this part. It's as important as the rest.

- **Do not make medical, legal, financial, or safety decisions based on it.**
  This is a traditional interpretive art, not evidence-based prediction. Don't
  skip a doctor, delay treatment, make an investment, or choose a surgery date
  because of what a passage says.
- **Do not treat it as fortune-telling about fixed events.** It will not tell
  you the date you'll marry, the day someone will die, the sex of an unborn
  child, or whether you'll "pass the exam." It reports planetary positions and
  classical interpretive principles, nothing more.
- **Do not use it to judge, screen, or discriminate against people** — for
  hiring, tenancy, relationships, medical triage, or any decision about
  another person. Using astrology to gate opportunities for others is harmful
  and, in many places, unlawful.
- **Do not enter other people's birth details without their consent.** Even
  though nothing leaves your device, a person's birth data is personal.
- **Do not expect two apps to agree exactly.** Results depend on the ayanamsa
  (this app uses Lahiri), the house system (this app uses whole-sign), and
  whether the true or mean lunar node is used (this app uses the mean node).
  Small differences between tools are normal and not a bug.
- **Do not rely on it with an unknown birth time.** Without an accurate time the
  ascendant, houses and dasha dates are guesses. The sign placements of the
  slower planets stay roughly right; the time-sensitive parts do not.
- **Do not read a difficult placement as doom.** Classical texts describe
  tendencies and themes, not verdicts. A "challenging" Saturn period in the
  texts is framed as a test that builds strength — the app presents it that way
  on purpose.

### 6. Accuracy and limitations

- Planetary longitudes come from a high-accuracy astronomy library; positions
  are reliable to well within the precision that chart work needs.
- The ayanamsa is a Lahiri polynomial accurate to a small fraction of an
  arc-minute across the modern era — more than enough for sign, house and
  nakshatra placement.
- Houses are **whole-sign** (each house is one whole sign from the ascendant).
  If you're used to Placidus or another system, house numbers for planets near
  sign boundaries may differ.
- Transits are tracked for **Jupiter and Saturn** (the slow movers that matter
  most for multi-year forecasts) plus **Sade Sati**; faster planets aren't
  listed in the date-range view.
- The knowledge base is a **curated set of principles**, not the complete text
  of any classic. It's meant to illustrate and cite, not to replace study of
  the originals.

## How it works

| Layer | Implementation |
| --- | --- |
| Planetary positions | [`astronomy-engine`](https://github.com/cosinekitty/astronomy) (pure JS, high accuracy) |
| Sidereal zodiac | Lahiri ayanamsa polynomial applied to tropical longitudes |
| Houses | Whole-sign, from the computed ascendant (Lagna) |
| Dasha | Vimshottari, from the natal Moon's nakshatra |
| Transits | Sampled sign-ingresses for Jupiter & Saturn, plus Sade Sati detection |
| Knowledge base | Paraphrased principles from classical texts, pre-indexed into static JSON |

The birth time you enter (local wall-clock) is converted to an absolute UTC
instant using the chosen timezone before any astronomy is computed, so results
are correct across DST and unusual offsets (e.g. India's +05:30, Nepal's +05:45).

## Knowledge base and sources

Interpretations are **paraphrased** principles — written in plain English and
attributed to the classical work each one traditionally comes from. No
copyrighted translation is reproduced verbatim. Source works (all public
domain):

- **Brihat Parashara Hora Shastra** (Maharishi Parashara)
- **Phaladeepika** (Mantreswara)
- **Saravali** (Kalyana Varma)
- **Brihat Jataka** (Varahamihira)
- **Jataka Parijata** (Vaidyanatha Dikshita)

### Expanding the knowledge base

The raw entries live in [`kb-sources/`](kb-sources/). The build script
`scripts/build-knowledge-base.mjs` validates them, assigns stable ids, builds an
inverted keyword index, and emits `public/kb/knowledge.json` and
`public/kb/index.json`.

To add more interpretations, append entries to any JSON file in `kb-sources/`
(or create a new `*.json` file there) and re-run `npm run build:kb`. Each entry
looks like this:

```json
{
  "source": "Phaladeepika",
  "topic": "planet-in-house",
  "match": { "planet": "Sun", "house": 10 },
  "title": "Sun in the 10th house",
  "text": "Paraphrased interpretive principle, in your own words …",
  "keywords": ["sun", "tenth house", "career", "authority"]
}
```

- `match` is the structured selector the Predictions tab uses to attach the
  entry to a chart feature. Supported keys include `planet`, `house`, `sign`,
  `dignity` (`exalted`/`debilitated`/`own-sign`), `nakshatra`, `dashaLord`,
  `yoga`, and `transit`+`phase`.
- `keywords` power the **Ask** tab's free-text search.
- Keep `text` as a **paraphrase in your own words** with a `source`
  attribution — don't paste a copyrighted translation verbatim.

## Develop

```bash
npm install
npm run build:kb   # (re)build the static knowledge base
npm run dev        # start the dev server
```

## Build

```bash
npm run build      # typecheck + production build into dist/
npm run preview    # preview the production build locally
```

## Deploy to GitHub Pages (free)

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main`. The included workflow
   (`.github/workflows/deploy.yml`) builds the knowledge base, builds the site
   with the correct base path (derived from the repo name), and publishes it.

The site will be available at `https://<your-user>.github.io/<repo-name>/`.

If your repository name is **not** `palmistry`, the local dev base path default
won't match, but deployment still works because the workflow sets `VITE_BASE`
from the repository name automatically. For local builds against a different
repo name, set it yourself:

```bash
VITE_BASE=/your-repo-name/ npm run build
```

## Disclaimer

This application is for cultural, educational and entertainment purposes.
Astrological predictions are a traditional interpretive art, not scientific
fact, and should not be relied upon for medical, legal, financial, or other
important life decisions.
