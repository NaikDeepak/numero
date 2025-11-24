# Frontend Architecture

The frontend is a React application initialized with Vite, focusing on a responsive and interactive user experience for numerology tools.

## Directory Structure (`src/`)

- **`components/`**: Reusable UI components.
  - `Header.jsx`: Application header with navigation and theme toggle.
  - `Footer.jsx`: Application footer.
  - `Navbar.jsx`: Secondary navigation bar (if used).
  - `NumerologyGrid.jsx`: Visual representation of the Lo Shu Grid.
- **`pages/`**: Main page views mapped to routes.
  - `GridCalculator.jsx`: The home page for entering details and viewing the main report.
  - `CompatibilityChecker.jsx`: Page for comparing two profiles.
  - `TeamWinPercentage.jsx`: Page for IPL team analysis.
- **`utils/`**: Frontend-specific utility functions.
- **`App.jsx`**: Root component handling layout and routing.
- **`index.css`**: Global styles and CSS variables for theming.

## Routing

Routing is managed by `react-router-dom`.

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `GridCalculator` | Main numerology calculator and report view. |
| `/compatibility` | `CompatibilityChecker` | Tool to check compatibility between two people. |
| `/win-percentage` | `TeamWinPercentage` | Tool to analyze sports team winning chances. |

## State Management

- **Local State**: Most components use `useState` for form inputs and API response data.
- **Theme State**: `App.jsx` manages the `theme` ('light'/'dark') state and persists it to `localStorage`. This state is passed down to `Header` for the toggle control.

## Theming

The application supports Light and Dark modes.
- **Implementation**: A `light-mode` class is toggled on the `<body>` element.
- **CSS Variables**: Colors are defined as CSS variables in `index.css` (e.g., `--bg-color`, `--text-color`) and change based on the presence of the `.light-mode` class.

## API Interaction

The frontend communicates with the backend using the native `fetch` API.
- **Base URL**: Relative paths (e.g., `/api/calculate`) are used, relying on the Vite proxy (in dev) or same-origin serving (in prod) to reach the backend.
