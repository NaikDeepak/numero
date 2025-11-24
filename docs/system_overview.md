# System Overview

## 1. High-Level Architecture

The **Numero** application is a full-stack web application designed to provide numerology calculations, AI-enhanced insights, and compatibility analysis. It follows a modern client-server architecture:

```mermaid
graph TD
    User[User] -->|Browser| Frontend[React Frontend (Vite)]
    Frontend -->|HTTP API| Backend[Express Backend]
    Backend -->|Numerology Logic| Utils[Calculation Utils]
    Backend -->|Data| JSON[JSON Data Files]
    Backend -->|AI Analysis| Gemini[Google Gemini API]
    Backend -->|PDF Generation| PDFKit[PDFKit]
```

- **Frontend**: A React-based Single Page Application (SPA) built with Vite. It handles user interactions, displays forms for numerology inputs, and renders results (grids, charts, reports).
- **Backend**: A Node.js/Express server that exposes RESTful API endpoints. It handles core numerology logic, communicates with external AI services (Google Gemini), and generates downloadable PDF reports.
- **Data Layer**: Static JSON files located in `api/data/` serve as the database for interpretative texts (meanings, remedies, compatibility rules).

## 2. Technology Stack

### Frontend
- **Framework**: React (v18)
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)
- **Styling**: CSS Modules / Standard CSS (with Light/Dark mode support)
- **State Management**: React `useState`, `useEffect`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **PDF Generation**: PDFKit
- **Utilities**: `dotenv` (Config), `cors` (Cross-Origin Resource Sharing), `express-rate-limit` (API Rate Limiting)

## 3. Project Structure

The codebase is organized into two main directories: `api` (Backend) and `src` (Frontend).

```
numero/
├── api/                    # Backend Code
│   ├── data/               # JSON data files (meanings, rules)
│   ├── utils/              # Helper functions (calculations)
│   ├── server.js           # Main Express server entry point
│   └── .env                # Backend environment variables
├── src/                    # Frontend Code
│   ├── components/         # Reusable React components (Header, Footer)
│   ├── pages/              # Page components (GridCalculator, etc.)
│   ├── App.jsx             # Main App component & Routing
│   └── main.jsx            # React entry point
├── public/                 # Static assets
├── docs/                   # Project Documentation
└── package.json            # Project dependencies and scripts
```
