# Knowledge base sources

The entries in this folder are **paraphrased interpretive principles** drawn from
public-domain classical texts of Vedic astrology (Jyotish). They are written in
plain English in our own words and attributed to the classical work each
principle traditionally comes from. No copyrighted translation is reproduced
verbatim.

## Source works (all public domain)

- **Brihat Parashara Hora Shastra (BPHS)** — attributed to Maharishi Parashara.
  The foundational text; houses, planetary significations, yogas, dashas.
- **Phaladeepika** — Mantreswara. Concise predictive rules for houses and
  planetary placements.
- **Saravali** — Kalyana Varma. Results of planets in signs and houses.
- **Brihat Jataka** — Varahamihira. Classical natal astrology.
- **Jataka Parijata** — Vaidyanatha Dikshita. Yogas and combinations.

## Format

Each `*.json` file is an array of knowledge entries. The build script
(`scripts/build-knowledge-base.mjs`) concatenates them, assigns stable ids,
builds an inverted keyword index, and emits `public/kb/knowledge.json` and
`public/kb/index.json` that the app loads at runtime.

Entry shape:

```json
{
  "source": "Phaladeepika",
  "topic": "planet-in-house",
  "match": { "planet": "Sun", "house": 10 },
  "title": "Sun in the 10th house",
  "text": "Paraphrased interpretive principle ...",
  "keywords": ["sun", "tenth house", "career", "authority"]
}
```

`match` is a structured selector the rule engine uses to attach the entry to a
computed chart feature. `keywords` feed free-text search.
