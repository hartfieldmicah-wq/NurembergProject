# Nuremberg Then & Now (Stage 1, v1.1)

An offline historical map of Nuremberg. Pure HTML/CSS/JavaScript, no dependencies, no build step.

- **Two looks:** Modern and Old map (engraving style, like the 1648 Merian map).
- **Four times:** 1648, 1939 (before the war), 1945 (after the bombing: rubble), Today.
- **17 tappable landmarks** (pins). Tap one for what it looked like in each era, facts, distance from you and directions.
- **Your location:** tap the target button. Away from Nuremberg, long-press the map to set a pretend location (also copies lat/lon).
- **Works offline** once opened one time online, and installs to the home screen.

## Publish on GitHub (so it can be installed on your phone)
1. Create a new GitHub repository and upload everything in this folder (keep the folder structure, including `.nojekyll`).
2. Repository **Settings > Pages > Build and deployment**: Source "Deploy from a branch", Branch `main`, folder `/ (root)`. Save.
3. After a minute your app is at `https://YOUR-NAME.github.io/REPO-NAME/` (HTTPS is required for offline mode and location).

## Install on your phone
- **iPhone:** open the link in **Safari**, tap Share, then **Add to Home Screen**. Open it once online; afterwards it works with no connection.
- **Android (Chrome):** menu, then **Install app**.

## Files
| File | Purpose |
|---|---|
| `index.html` | App shell and icon sprite |
| `css/style.css` | All styling (both map styles) |
| `js/data.js` | **Landmarks, eras, history texts** (edit/add here) |
| `js/osm-data.js` | **Real OpenStreetMap geometry** (12,202 buildings, streets, river, parks, city wall), compacted for offline use |
| `js/basemap.js` | Draws that data in Modern / Old-map style and the four eras (incl. 1945 rubble) |
| `js/mapview.js` | Pan / zoom / pinch engine |
| `js/app.js` | UI, location, offline status |
| `sw.js` | Service worker for offline use |
| `manifest.webmanifest`, `icons/`, `apple-touch-icon.png` | Home-screen install and icons |

## Adding or fixing a landmark
Open `js/data.js`, copy an entry in `LANDMARKS`, change `lat`/`lon`, text and per-era status (`standing`, `damaged`, `ruin`, `rebuilt`, `absent`). To get exact coordinates, long-press the map in the app and tap Copy.

**After any change, bump `VERSION` in `sw.js`** (e.g. `1.0.1`) so phones download the update.

## Honest limitations
- Streets, buildings, river, parks and wall are **real OpenStreetMap data (today's layout)**, so 1648 and 1939 reuse today's building outlines inside the old town (an approximation). The 1945 rubble is illustrative (about 90% of the old town was destroyed; which individual houses are shown destroyed is pseudo-random), except for the landmarks, whose condition comes from the texts.
- History texts are short summaries written without live fact-checking; verify before publishing.
- iOS may clear web data for sites you have not opened in a long time; an app added to the Home Screen is kept much longer.

Map data (c) OpenStreetMap contributors, ODbL (https://www.openstreetmap.org/copyright). Keep this credit.

## Roadmap toward AR
1. Overlay georeferenced historical map scans (1648 Merian, 1940, 1945 bomb damage maps) on the real geodata.
2. Add photos and 3D "then" models per landmark (store files in the repo; add to the offline cache list in `sw.js`).
3. Build the AR view in Unity (AR Foundation + ARCore Geospatial / ARKit geo-anchoring), reusing `data.js` as the landmark database.
