# Paul Cummings / CoAgentics site

Static GitHub Pages site. Upload the contents of this folder to the repository root.

Entry point: `index.html`

Primary pages:
- `index.html` — system overview
- `research.html` — architecture
- `c2-sandbox.html` — C2 matched-experiment sandbox (primary demo)
- `dca-demo.html` — DCA instrument
- `economics.html` / `economics-demo.html` — economics case
- `book.html` — Thinking Together

## C2 Sandbox
`c2-sandbox.html` keeps one Three.js stage for history and experiment modes. Experiment mode animates baseline + counterfactual craft with a Δ HUD (seed 1842). If the Three.js CDN fails, a 2D dual-path fallback still runs the method demo.
