# Valentine's Day Quiz - Gentle Monster Edition

A luxurious, Three.js-powered Valentine's Day treasure hunt quiz.

## Quick Start

```bash
# Preview locally
npx serve .

# Deploy to Vercel
vercel
```

## Customization

### Edit Questions & Messages

Open `index.html` and find the `CONFIG` object near line 260:

```javascript
const CONFIG = {
    secretWord: "VALENTINE",  // Each letter = 1 question

    finalMessage: "Your custom message here...",

    questions: [
        {
            question: "Your question here?",
            options: ["Correct answer", "Wrong 1", "Wrong 2", "Wrong 3"],
            hint: "Hint shown when wrong..."
        },
        // ... 9 questions total for VALENTINE
    ]
};
```

**Important:** The FIRST option is always the correct answer (automatically shuffled).

### Add Custom 3D Models

1. Place your `.glb` files in the `/models/` folder
2. Update the paths in the CONFIG:

```javascript
scene: {
    models: {
        heart: "/models/heart.glb",
        rose: "/models/rose.glb",
        chocolate: "/models/chocolate.glb",
    }
}
```

#### Recommended Model Sources (Free)

- [Sketchfab](https://sketchfab.com) - Search for "heart", "rose", "chocolate box"
- [Poly Pizza](https://poly.pizza) - Low-poly free models
- [Quaternius](https://quaternius.com) - Free game assets

**Model Tips:**
- Use GLB format (compressed GLTF)
- Keep models under 2MB each for fast loading
- Optimize with [gltf.report](https://gltf.report) if needed

### Adjust 3D Scene

```javascript
scene: {
    colors: {
        heart: 0xd4a5a5,     // Dusty rose
        rose: 0xe8b4b8,      // Pink
        chocolate: 0x8b5a5a, // Deep mauve
        gold: 0xc9a86c       // Muted gold
    },
    objectCount: {
        hearts: 8,
        roses: 5,
        chocolates: 4,
        particles: 100
    }
}
```

## Features

- Three.js 3D scene with floating hearts, roses & chocolates
- Unreal Bloom post-processing for that dreamy glow
- Parallax camera movement following mouse
- Gentle Monster-inspired minimalist aesthetic
- Glassmorphism UI elements
- Custom GLB model support
- Responsive design
- The "No" button runs away

## Tech Stack

- Three.js r128
- GLTFLoader for custom models
- EffectComposer with UnrealBloomPass
- Pure HTML/CSS/JS (no build step)

## Deploy

Just push to Vercel, Netlify, or any static host. No build required.

```bash
vercel --prod
```
