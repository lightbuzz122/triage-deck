# Triage Deck

Practise clinical decisions at the bedside. Triage Deck is a browser-based virtual-patient simulator: take a history, examine with real techniques, attach monitoring, order tests on a resource budget, treat, and get a scored debrief.

It's a static site (plain HTML, CSS and JavaScript). There is no build step and nothing to install.

## Project layout

```
index.html        Homepage, bedside player and debrief (markup and styles)
engine.js         Shared player: monitor, examination, viewers, scoring
home.js           Homepage: live hero, specialty case files, leaderboard
case-stemi.js     Case: crushing chest pain (cardiology)
case-neuro.js     Case: confused after a fall (neurology)
img/              Patient images and close-ups
favicon.svg       Browser tab icon
vercel.json       Vercel settings (clean URLs, image caching)
```

## Run it locally

Any static file server works. From this folder:

```
npx serve .
```

or

```
python3 -m http.server 8000
```

Then open the address it prints. Opening `index.html` directly from disk also works in most browsers.

## Put it on GitHub

1. On github.com, create a new repository called `triage-deck`. Leave it empty (no README or licence).
2. In a terminal, from this folder:

```
git remote add origin https://github.com/<your-username>/triage-deck.git
git branch -M main
git push -u origin main
```

This folder is already a Git repository with one commit, so those three commands are all you need.

## Deploy on Vercel

1. Go to vercel.com, choose **Add New → Project**, and import the `triage-deck` repository.
2. Framework preset: **Other**. Leave the build command empty and the output directory as the root (`./`).
3. Click **Deploy**. Vercel gives you a link such as `triage-deck.vercel.app` to share.

Every push to `main` redeploys automatically.

## Adding a case

Each case is one file that adds itself to `window.CASEDEFS`. Copy `case-neuro.js` as a starting point, add a `<script src="case-yours.js"></script>` line in `index.html` before `engine.js`, and add its images under `img/`. To place it under a specialty on the homepage, add its id to `CASE_SPECS` in `home.js`.

## Leaderboard

On the public site, scores are posted to a leaderboard kept on the player's own device. Several people can post on one shared computer, which suits a classroom. A shared online leaderboard needs a small backend (for example Supabase or Vercel KV) and accounts; `home.js` is structured so that can be added without changing the rest.

## Disclaimer

Triage Deck is an educational prototype. Case content is illustrative, not clinical guidance; follow your local protocols. Patients are fictional.
