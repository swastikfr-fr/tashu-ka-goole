# Tashu Ka Google
Side-by-side comparison of PageRank (Old Google) and in-degree link popularity (New Google). Plain HTML/CSS/JS, no build step.

## Files
index.html · style.css · script.js (UI) · algorithms.js (ranking maths) · data.js (**your data**) · vercel.json

## Your data
Edit `data.js`: the `websites` array (id, name, url, description, category, keywords, linksTo) and `expectedNewAlgorithmWinner`. Open the "Developer checks" section on the page to see whether the expected winner really ranks #1 (it is validated, never forced).

## Algorithms
- Old Google: PR(p) = (1-d)/N + d·Σ PR(q)/out(q), d = 0.85, repeated until the change is < 1e-8. Dead-end pages share their score evenly.
- New Google: count distinct sites linking to each page; sort descending. A simplified demo algorithm, not Google's real one.
Both rank the same set of search matches, using scores from the full link graph.

## Run locally
Open `index.html`, or run `npx serve .` / `python3 -m http.server` and visit the printed address.

## Deploy on Vercel
1. Push this folder to GitHub.  2. vercel.com → Add New → Project → import the repo.  3. Framework preset "Other", no build command, leave output directory empty → Deploy.
(Or: `npm i -g vercel`, then run `vercel --prod` inside the folder.)
