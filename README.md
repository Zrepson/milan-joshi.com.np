# Milan Joshi — Earth Portfolio

An Earth-centered personal portfolio built from the Three.js WebGPU Earth concept.

## Stack
- Three.js WebGPU
- Three Shading Language (TSL)
- OrbitControls
- GSAP
- Semantic HTML/CSS

## Development
The page is static and can be served by GitHub Pages or any static host. WebGPU requires a compatible browser/device; portfolio content remains accessible when WebGPU is unavailable.

## Production notes
Earth textures currently use the Three.js public example assets. For production hardening, self-host the textures under an `assets/` directory and pin all external dependencies.
