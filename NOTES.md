# NOVA NUTRITION — Project Notes

## ⚠️ To do when work resumes (client sends product images)
- [ ] Footer credit: "Made by ArtLife Web Studio" with a link to the studio site (artlife-studio.uz, confirm the URL)
- [ ] Put the real product images on the tubs and in the lineup
- [ ] Client confirms the placeholder content (see below)
- [ ] Build a clean Netlify deploy folder (leave out NOTES.md, inspiration.md, assets/images/source)

## Decisions so far (2026-11-23)
- **Audience:** bodybuilders and serious gym-goers.
- **Style:** More Nutrition's technique (3D product on scroll, smooth motion, polish) with a dark, hardcore, premium look (closer to ProSupps). Not More's soft pastel mood.
- **Typography:** taken from More Nutrition (big, condensed, uppercase headlines; clean condensed body text).
- **Font:** **Barlow Condensed** (free, Google Fonts) — chosen over paid Founders Grotesk. Weights: 700 uppercase headlines, 600 stats, 500 nav/buttons, 400 body.
- **Logo:** chrome/silver Nova logo supplied by the client, on a transparent background.
- **Product images:** coming later from the client.

- **Domain:** novanutritionlabs.com (confirmed)
- **Product images:** placeholders for now, real ones come later.

## Build design (approved 2026-11-23)
- **Stack:** static HTML/CSS/JS for Netlify. Three.js (3D tub), GSAP (tweens), Lenis (smooth scroll), all from CDN. Netlify Forms handles the distributor form.
- **Palette:** black `#000`, graphite `#15171b`, steel `#c9ced6`, smoke `#8b919a`, white `#f3f5f7`. Accent per product: whey `#3d8bff` (brand electric blue), gainer `#ff6a2b`, creatine `#a98bff`.
- **Type:** Barlow Condensed 800 italic for the giant chrome "NOVA" and headlines (echoes the slanted logo). Barlow for body text.
- **The memorable thing:** one live 3D Nova tub that travels down the page, from the hero (inside a blue "nova" flare) to a scroll-driven 360° spin with stats, the range (re-labels and re-colours per product), and the size picker (scales the tub).
- **Placeholder products:** the tub label is drawn in code (logo, product name, flavour, size). When real product renders arrive, swap the label texture or replace it with a frame-sequence render.
- **Sections:** loader, hero (stat badges on a ring), spin with stat cards, range (three-tub lineup: the chosen tub travels on, the side tubs stay), sizes, compare (3D scoop and "Nova vs typical supplement" table), what's inside, marquee, why Nova, distributors form, footer.

## Placeholder content to confirm with the client
- All nutrition numbers, flavours, sizes and servings (modelled on the XGENS and IRON FUEL lineups).
- "Why Nova" claims (lab testing and so on).
- The comparison table rows. It compares Nova with a "typical supplement", so every row must be true for all three products.
- Social links and contact email in the footer.

## Open questions
- None blocking.

## Assets
`assets/images/`: scoop photos generated in Google Flow (Nano Banana 2.1), project "нояб. 23 - 09:13" in the client's Flow account
- `scoop-chocolate`, `scoop-vanilla`, `scoop-creatine` (.webp + .jpg, 1400px), swapped per product
- `source/`: the 2K originals as downloaded from Flow
- Prompt: steel measuring scoop heaped with powder, dark charcoal background, soft key light with a blue rim, 3/4 top-down, square. Vanilla and creatine are Flow edits of the chocolate image ("change only the powder colour").

`assets/logo/`
- `nova-logo-chrome.png`: main logo, shiny chrome (recommended)
- `nova-logo-chrome-mark.png`: circle N only (nav, favicon, loader)
- `nova-logo-chrome-wordmark.png`: "NOVANUTRITION" text only
- `nova-logo-matte*.png`: same three, brushed/matte version
- `original/`: the client's original JPGs

The transparent PNGs are made for **dark backgrounds**. On white they look washed out, because the logo's shadows were part of the black background. For a light background, ask the client for a vector (SVG/AI/EPS) file.

## Fonts
More Nutrition uses **Founders Grotesk Condensed** (Klim Type Foundry), weights 400/500/600/700:
- Headlines: 700, UPPERCASE, very large, tight line height
- Stats ("20g", "95%"): 600
- Nav and buttons: 500
- Body text: 400

Founders Grotesk is a **paid font**, and a web licence from klim.co.nz is needed to use it.
Free near-match on Google Fonts: **Barlow Condensed** (or Oswald for heavier headlines).
