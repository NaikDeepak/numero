# Codebase Structure

**Analysis Date:** 2026-02-01

## Directory Layout

```
numero/
├── api/                # Backend Express application
│   ├── data/           # JSON datasets for numerology meanings
│   ├── services/       # External service integrations (e.g., PhonePe)
│   ├── utils/          # Core numerology logic and helper functions
│   └── server.js       # Main API entry point
├── public/             # Static assets (images, icons)
├── src/                # Frontend React application
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers (Auth)
│   ├── data/           # Frontend-specific data (e.g., IPL teams)
│   ├── pages/          # Route-level page components
│   ├── App.jsx         # Main React component & routing
│   └── index.jsx       # Frontend entry point
├── docs/               # System documentation and developer guides
├── firebase.json       # Firebase Hosting/Firestore config
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite build configuration
```

## Directory Purposes

**api/data/:**
- Purpose: Source of truth for all numerology interpretations.
- Contains: JSON files.
- Key files: `moolankMeanings.json`, `compatibilityData.json`, `gridAnalysisDefinitions.json`.

**api/utils/:**
- Purpose: Pure functions for numerology calculations and PDF generation.
- Contains: JavaScript logic and unit tests.
- Key files: `numerologyUtils.js`, `reportGenerator.js`.

**src/components/:**
- Purpose: Shared React components.
- Contains: `.jsx` and `.css` files.
- Key files: `Header.jsx`, `Footer.jsx`, `ResultCard.jsx`.

**src/pages/:**
- Purpose: Primary application views.
- Contains: Complex components representing full pages.
- Key files: `GridCalculator.jsx`, `CompatibilityChecker.jsx`, `TeamWinPercentage.jsx`.

## Key File Locations

**Entry Points:**
- `src/index.jsx`: Frontend initialization.
- `api/server.js`: Backend initialization.

**Configuration:**
- `vite.config.js`: Build tool configuration.
- `firebase.json`: Deployment and Firebase service configuration.
- `api/.env`: Backend environment variables (API keys, etc.).

**Core Logic:**
- `api/utils/numerologyUtils.js`: The "brain" of the numerology engine.

**Testing:**
- `api/utils/numerologyUtils.test.js`: Backend logic tests.

## Naming Conventions

**Files:**
- React Components: PascalCase (e.g., `ResultCard.jsx`).
- Utilities/APIs: camelCase (e.g., `numerologyUtils.js`).
- Styles: Match component name (e.g., `ResultCard.css`).

**Directories:**
- Plural lowercase (e.g., `components`, `pages`, `utils`).

## Where to Add New Code

**New Feature (Calculation-based):**
- Logic: `api/utils/numerologyUtils.js`
- Data: `api/data/newFeatureData.json`
- Endpoint: `api/server.js`
- UI: `src/pages/NewFeaturePage.jsx`

**New Component:**
- Implementation: `src/components/MyNewComponent.jsx`
- Styles: `src/components/MyNewComponent.css`

**Utilities:**
- Shared helpers: `api/utils/` for backend or `src/numerologyUtils.js` for frontend (note: some logic is currently duplicated).

## Special Directories

**dist/:**
- Purpose: Compiled production build of the frontend.
- Generated: Yes.
- Committed: No (typically).

**node_modules/:**
- Purpose: Project dependencies.
- Generated: Yes (via `npm install` or `yarn install`).
- Committed: No.

---

*Structure analysis: 2026-02-01*
