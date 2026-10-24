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

The raw entries live in [`kb-sources/`](kb-sources/). The build script
`scripts/build-knowledge-base.mjs` validates them, assigns stable ids, builds an
inverted keyword index, and emits `public/kb/knowledge.json` and
`public/kb/index.json`. To expand the knowledge base, add entries to the JSON
files in `kb-sources/` and re-run `npm run build:kb`.

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
