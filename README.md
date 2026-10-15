# CS Class of 2026 — Kenyatta University Virtual Yearbook

A static, responsive virtual yearbook website for the Computer Science graduating class of 2026 at Kenyatta University.

## Quick Start

```bash
npm install
npm run build      # Parse Excel → data/class.json
npm run serve      # Open in browser at localhost:8080
```

## How It Works

1. **Excel file** (`Class Yearbook Profile and Memories Submission (Responses).xlsx`) contains student profiles
2. **`npm run build`** runs `scripts/parse-excel.js`, which parses the Excel into `data/class.json`
3. **Images** in `img/` are matched to names automatically (with manual overrides for tricky filenames)
4. The site loads `data/class.json` at runtime and populates all pages dynamically

## Adding/Replacing the Excel File

1. Replace the `.xlsx` file in the project root
2. Ensure columns include: `Full Name`, `Nickname`, `Specialization in final year`, `A brief description about yourself`, `A kind word to the class`
3. Run `npm run build` to regenerate `data/class.json`

## Image Naming

Images go in `img/`. The parser matches images to names using the text after ` - ` in the filename:

```
IMG_1234 - John Doe.jpg    →  matched to "John Doe"
photo - Jane Smith.png     →  matched to "Jane Smith"
```

For difficult matches, add manual mappings in `scripts/parse-excel.js` in the `manualMap` object. If no image matches, a gradient placeholder with initials is shown.

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero carousel, nav tiles, graduation countdown |
| Yearbook | `yearbook.html` | Profiles grouped by specialization |
| People | `people.html` | Searchable/filterable directory |
| Editor's Note | `editors-note.html` | Welcome message (editable) |
| Class Reps | `class-reps.html` | Class representative profiles (editable) |
| Fun Zone | `funzone.html` | 7 interactive mini-games |
| Guestbook | `guestbook.html` | Local sticky-note guestbook |

## Fun Zone Games

All games pull names/photos from `data/class.json` automatically:

1. **Spin the Wheel** — Random classmate spotlight
2. **Guess Who?** — Photo → name guessing game
3. **Most Likely To...** — Vote on fun superlatives
4. **Memory Match** — Match photos to names
5. **Which Classmate Are You?** — Personality quiz
6. **Classmate Bingo** — 5x5 name bingo
7. **Graduation Countdown** — Live timer with confetti

## Customization

- **Editor's Note**: Edit `editors-note.html`, look for `<!-- TODO: replace -->` comments
- **Class Reps**: Edit `class-reps.html`, look for `<!-- TODO: replace -->` comments
- **Graduation Date**: Change `GRADUATION_DATE` in `js/yearbook.js`
- **Theme Colors**: Modify CSS variables in `css/yearbook.css` under `:root`
- **Light/Dark Mode**: Toggle button in bottom-right corner; preference saved in localStorage

## Deploying

This is a fully static site. Deploy to any static host:

### Netlify / Vercel
1. Run `npm run build` locally (or add as build command)
2. Deploy the entire project folder
3. No server-side processing needed

### GitHub Pages
1. Push the entire repo to GitHub
2. Enable GitHub Pages from Settings → Pages → Deploy from branch

## Tech Stack

- HTML5 + CSS3 + Vanilla JavaScript
- Bootstrap 5 (customized dark theme)
- jQuery + Owl Carousel + WOW.js + Lightbox
- No build tools required for the frontend (just the Excel parser)

## Credits

- Base template: [Poseify by HTML Codex](https://htmlcodex.com) / [ThemeWagon](https://themewagon.com)
- Fonts: Josefin Sans, Work Sans (Google Fonts)
- Icons: Font Awesome 6, Bootstrap Icons
