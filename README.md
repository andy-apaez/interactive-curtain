## Interactive Curtain Demo

This project renders a cloth-like curtain that reacts when your mouse brushes across it. Under the hood, a lightweight Verlet‑integration cloth simulation keeps a grid of particles connected by constraints, while mouse movement injects localized force to push sections of fabric aside.

### Getting Started

1. Clone or download this repository.
2. Open `index.html` directly in a modern browser (Chrome, Firefox, Edge, Safari).
3. Move the mouse over the canvas to see the curtain sway.

### How It Works

- `curtain.js` builds a 2D lattice of particles (columns × rows) and connects them with “sticks” that keep neighboring points a fixed distance apart.
- Pinned points along the top edge anchor the cloth; gravity, damping, and constraint iterations give it a fabric feel.
- Mouse position is tracked and converted into directional impulses for nearby particles, so the curtain parts where you hover.
- `style.css` applies a dark stage-like backdrop and scales the canvas responsively.

### Customizing

Tune the `settings` object in `curtain.js` to adjust behavior:

- `cols` / `rows`: Cloth resolution (more points = smoother but slower).
- `gravity`, `damping`: Heaviness and resistance.
- `mouseRadius`, `mouseForce`: Interaction range and strength.
- `pinSpacing`: How many top nodes stay fixed.

You can also add touch handlers for mobile, change the color palette in `style.css`, or replace the rendering logic with WebGL/Three.js for more advanced shading.
