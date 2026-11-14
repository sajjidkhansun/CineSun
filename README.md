# CineSun

One colourful home for movies & series — a static, no-build streaming-browse site with a worldwide live catalogue.

## Features

- Worldwide live catalogue (movies, series & anime) via the keyless Cinemeta CDN — thousands of titles, loaded on scroll
- Direct play links to verified players (VidLink · Mapple) with a season/episode picker for series
- Live search, genre rows, Top-10 charts, Anime section, hero carousel, random pick
- Glass navbar + mobile dock, fits down to 320px screens
- Lifetime visit counter in the footer
- Lighthouse: 100 Accessibility · 100 Best Practices · 100 SEO

## Run it

Pure static files — no build step. Serve the folder with any static server, or just open `index.html`:

```powershell
python -m http.server 8080
```

Deployable as-is to Netlify, GitHub Pages, or any static host.

## Structure

```
index.html      shell, navigation, footer
styles.css      theme (dark green + lime)
js/data.js      curated catalog, platforms, players, genre order
js/posters.js   artwork resolution + procedural fallback art
js/app.js       all behaviour (rows, search, modal, episode picker, live catalogue)
assets/         CineSun logo (mark + full)
robots.txt
```

## Credit

Developed by [@sunkhannnn](https://instagram.com/sunkhannnn) · © 2026 CineSun
