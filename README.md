# Aquarium Water Change Volume Calculator

A single-page widget designed for fish keepers to calculate exact water change volumes, bucket requirements, and livestock safety indicators during routine tank cleaning.

**Live Demo:** [https://trefeon.github.io/aquarium-water-change-volume-calculator/](https://trefeon.github.io/aquarium-water-change-volume-calculator/)

---

## Features

### 1. Inputs
- **Tank Size:** Configurable total capacity with real-time conversion between US Gallons (`gal`) and Liters (`L`), plus one-tap standard tank presets.
- **Desired Water Change Percentage:** Smooth range slider from 10% to 90% with live percentage readout and visual boundary markers (`10% Safe`, `50%`, `90% Emergency`).
- **Bucket Planning:** Configurable bucket volume (defaulting to standard 5 gallons / 18.93 L) and number of buckets planned for trip counting.

### 2. Live Outputs
- **Total Volume to Remove:** Dual-unit readout displaying both gallons and liters simultaneously with tabular numerals to prevent layout jitter.
- **Exact Bucket Breakdown:** Calculates exact full buckets needed and explicit leftover partial bucket volume (`X full buckets needed + 1 partial bucket (Y gal leftover)` or `exact — no partial`).
- **Trip Efficiency Counter:** Calculates total round trips based on available buckets (`Requires X trips with your Y planned buckets`).

### 3. Color-Coded Health & Mood Indicator
- **10% – 30% (Green · Safe Weekly):** Routine safe water change. Fish (`🐠`) swims calmly across the tank.
- **31% – 50% (Yellow · Deeper Clean):** Deeper clean for stocked tanks. Fish (`🐟`) darts alertly.
- **51% – 75% (Red · Emergency Change):** Triggers a prominent **`Fish stress warning`** banner. Fish (`🐡`) puffs up and shivers with a red distress aura.
- **76% – 90% (Red · Extreme Drainage):** Fish floats upside down (`belly-up`) directly on the waterline, illustrating severe aquatic stress.

### 4. Interactive Aquatic Physics
- **Top-to-Bottom Drainage:** Draining water lowers the water level from the top downwards (`▲ X% water to remove`), leaving the remaining water anchored at the bottom.
- **Liquid Waves:** Dual-layered animated SVG wave ripples on the water surface.
- **Bubble Boundary:** Rising aeration bubbles are strictly contained within the water body and burst upon reaching the surface.

---

## Technical Specifications

- **Zero Dependencies:** Pure vanilla HTML5, CSS3, and JavaScript. No build step, no frameworks, no backend.
- **Offline First:** All math executes client-side; user preferences persist via `localStorage`.
- **Accessibility:** WCAG 2.2 compliant (`aria-live="polite"`, `aria-pressed`, `input:focus-visible`, and `@media (prefers-reduced-motion: reduce)`).
- **Constants:** $1\text{ US Gallon} = 3.78541\text{ Liters}$.
