# Stachecups - Custom Cup Design Platform

A Nuxt 3 application for designing custom cups with real-time 2D canvas editing and 3D preview.

## Features

- ✅ **Fabric.js Canvas** - Full-featured design editor
- ✅ **Image Upload** - Upload and manipulate images
- ✅ **Text Editor** - Custom fonts, colors, sizes
- ✅ **Undo/Redo** - 50 steps of history
- ✅ **Product Switcher** - Multiple cup sizes with auto-scaling
- ✅ **Save/Load** - localStorage-based design management
- ✅ **Auto-Save** - Every 30 seconds
- ✅ **Export PNG** - Download flattened designs
- ✅ **3D Preview** - Real-time cup visualization (in development)
- ✅ **Drawing Tools** - Freehand drawing on canvas
- ✅ **Layer Management** - Bring to front, send to back
- ✅ **Keyboard Shortcuts** - Delete, Ctrl+Z, Ctrl+Y, Ctrl+D

## Tech Stack

- **Framework:** Nuxt 3
- **UI Library:** Quasar
- **Canvas:** Fabric.js 6.x
- **3D Rendering:** Three.js
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Type Safety:** TypeScript
- **Utilities:** @vueuse/core

## Recent Fixes (2025-10-09)

### Critical Issues Resolved ✅
1. Created missing TypeScript type definitions
2. Fixed app.vue routing (NuxtPage instead of NuxtWelcome)
3. Converted history composable to Pinia store
4. Fixed localStorage SSR safety
5. Replaced alert() with Quasar notifications
6. Added debouncing to 3D preview updates
7. Fixed canvas scaling when switching products
8. Created sample products.json
9. Added TypeScript to customizer component
10. Enhanced .gitignore

See `FIXES_SUMMARY.md` for detailed changes.

## Setup

Install dependencies:

```bash
yarn install
```

## Development Server

Start the dev server on `http://localhost:3000` (or 3001 if 3000 is taken):

```bash
yarn dev
```

## Project Structure

```
stachecups/
├── app/
│   └── app.vue              # Root layout
├── assets/
│   └── css/
│       └── tailwind.css     # Global styles
├── components/
│   ├── canvas/
│   │   ├── CanvasArea.vue   # Canvas wrapper
│   │   ├── FabricCanvas.vue # Main Fabric.js component
│   │   └── DrawTool.vue     # Drawing overlay
│   ├── preview3D/
│   │   └── CupViewer.vue    # Three.js 3D preview
│   ├── sidebars/
│   │   ├── ToolbarSidebar.vue  # Left toolbar
│   │   └── InfoSidebar.vue     # Right info panel
│   ├── toolbars/
│   │   ├── FloatingToolbar.vue # Image controls
│   │   └── TextFormatToolbar.vue # Text formatting
│   └── ui/
│       ├── ToolButton.vue
│       ├── SectionTitle.vue
│       └── SavedDesignItem.vue
├── composables/
│   ├── useHistory.ts        # Undo/redo wrapper
│   ├── useLocalStorage.ts   # localStorage utilities
│   └── useLayers.ts         # Layer management
├── pages/
│   ├── index.vue            # Landing page
│   └── customizer.vue       # Main editor
├── public/
│   ├── products.json        # Product definitions
│   ├── patterns/            # Background patterns
│   ├── frames/              # Image frames
│   ├── monograms/           # Monogram assets
│   └── models/              # 3D GLB models
├── store/
│   ├── designStore.ts       # Design state
│   ├── productStore.ts      # Product catalog
│   ├── assetStore.ts        # Assets (patterns, etc.)
│   └── historyStore.ts      # Undo/redo history
├── types/
│   └── index.ts             # TypeScript interfaces
└── utils/
    ├── fileTools.ts         # File validation
    ├── flattenPNG.ts        # PNG export
    ├── colorTools.ts        # Color utilities
    └── productMapper.ts     # Product scaling

```

## Key Features

### Canvas Operations

**Add Text:**
```typescript
// pages/customizer.vue
handleAddText() {
  canvas.addText('Your text', {
    fontSize: 40,
    fill: '#000000'
  });
}
```

**Upload Image:**
```typescript
handleImageUpload(file) {
  const dataURL = await readFileAsDataURL(file);
  canvas.addImage(dataURL);
}
```

**Undo/Redo:**
```typescript
const { canUndo, canRedo, undo, redo } = useHistory();
// Ctrl+Z, Ctrl+Y supported
```

### Product Management

Products are loaded from `public/products.json`:

```json
{
  "sku": "CUP-BANDIT-23OZ",
  "name": "23oz Bandit Cup",
  "canvasWidth": 1200,
  "canvasHeight": 800,
  "price": 24.99
}
```

When switching products, the canvas automatically scales all objects proportionally.

### localStorage Schema

```typescript
// Design storage
localStorage.getItem('stachecups_designs')
// Array of SavedDesign objects

localStorage.getItem('stachecups_autosave')
// Auto-save backup (expires after 24h)
```

## Configuration

### Nuxt Config (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  ssr: false,  // Client-side only
  modules: ['@pinia/nuxt', 'nuxt-quasar-ui', '@nuxtjs/tailwindcss'],
  quasar: {
    plugins: ['Loading', 'Notify', 'Dialog', 'Screen']
  }
})
```

### Tailwind Config (`tailwind.config.js`)

Custom theme and utilities for the design editor.

## Testing

See `TEST_CHECKLIST.md` for comprehensive testing guide.

Quick test:
```bash
# Start server
yarn dev

# Navigate to
http://localhost:3000/customizer

# Try:
1. Add text
2. Upload image
3. Save design
4. Refresh page
5. Restore auto-save
```

## Production Build

Build for production:

```bash
yarn build
```

Preview production build:

```bash
yarn preview
```

## Environment Variables

Create `.env` file:

```env
# Optional: AWS S3 for cloud storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# Optional: Analytics
NUXT_PUBLIC_GA_ID=
```

## Keyboard Shortcuts

- `Delete` - Delete selected object
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+Shift+Z` - Redo (alternative)
- `Ctrl+D` - Duplicate selected object
- `Backspace` - Delete selected object (alternative)

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## Known Limitations

1. **localStorage limit:** ~5-10MB per domain (stores ~10-20 designs)
2. **History limit:** 50 undo/redo steps (in memory, not persisted)
3. **Image size:** Max 10MB per upload
4. **SSR disabled:** Client-side rendering only
5. **3D models:** Must be manually added to `/public/models/`

## Troubleshooting

### Canvas not rendering
Check browser console for Fabric.js errors. Ensure canvas dimensions are valid.

### localStorage quota exceeded
Clear old designs or implement cloud storage.

### TypeScript errors
Run `yarn build` to check for type errors. Verify `types/index.ts` exists.

### Product images missing
Add product thumbnails to `/public/products/` directory.

### 3D preview not working
Ensure GLB models exist in `/public/models/` and Three.js is loaded.

## Development Tips

1. **Hot reload:** Changes auto-refresh in dev mode
2. **State inspection:** Use Vue DevTools for Pinia stores
3. **Canvas debugging:** Use Fabric.js DevTools extension
4. **localStorage viewer:** Chrome DevTools > Application > Local Storage

## Contributing

1. Follow existing code structure
2. Use TypeScript for all new files
3. Add JSDoc comments to functions
4. Test on multiple browsers
5. Update TEST_CHECKLIST.md

## Roadmap

- [ ] Filerobot photo editor integration
- [ ] Advanced layer panel with drag-drop
- [ ] URL-based design sharing (LZ-string)
- [ ] Pattern/monogram browser
- [ ] Custom font uploader
- [ ] Collaboration features
- [ ] Cloud storage (AWS S3)
- [ ] Design templates
- [ ] Batch export
- [ ] Mobile app (Capacitor)

## License

Proprietary - All rights reserved

## Support

For issues or questions, check:
1. `FIXES_SUMMARY.md` - Recent fixes
2. `TEST_CHECKLIST.md` - Testing guide
3. Browser console for errors
4. Vue DevTools for state inspection

---

Built with ❤️ using Nuxt 3 and Fabric.js
