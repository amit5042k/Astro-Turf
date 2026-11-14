# Weekly astrologer notes

One file per week, named by that week's **Monday** date: `YYYY-MM-DD.json`.
The app loads the file for the week being viewed and shows each lagna's text in an
"Astrologer's weekly note" card above the calculated rashifal.

```json
{
  "weekStart": "2026-11-16",
  "source": "Credit line shown under the note",
  "lagnas": {
    "aries":   { "hi": "…", "en": "…" },
    "taurus":  { "hi": "…", "en": "…" }
  }
}
```

Lagna keys: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces.
Either language may be omitted; the app falls back to whichever is present.

Easiest workflow: open the in-app **Editor**, type the 12 notes, click **Export JSON**, and commit the
downloaded file here. Only publish text you have the right to share, and credit the source.
