# Developer Guide

This guide provides instructions for setting up, running, and maintaining the **Numero** application.

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18 or higher (Recommended)
- **npm** (Node Package Manager) or **yarn**

## 2. Installation

The project uses a single `package.json` at the root to manage dependencies for both frontend and backend (though they are logically separated).

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd numero
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

## 3. Environment Configuration

The backend relies on environment variables for configuration, specifically for the AI integration.

1.  Create a `.env` file in the `api/` directory (or ensure the existing one is configured):
    ```bash
    # api/.env
    GEMINI_API_KEY=your_google_gemini_api_key_here
    PORT=3001
    ```
    > **Note**: Get your API key from [Google AI Studio](https://aistudio.google.com/).

## 4. Running the Application

You can run the frontend and backend separately or concurrently (if scripts allow, currently standard scripts are provided).

### Start the Backend
The backend runs on port `3001` (default).
```bash
node api/server.js
```
*Watch the console for "Server running on port 3001" and Gemini connection status.*

### Start the Frontend
The frontend runs via Vite (usually port `5173`).
```bash
npm run dev
```
*Open your browser at `http://localhost:5173`.*

## 5. Key Scripts

Defined in `package.json`:
- `npm run dev`: Starts the Vite development server (Frontend).
- `npm run build`: Builds the frontend for production.
- `npm run preview`: Previews the production build.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run format`: Formats code using Prettier.
- `npm test`: Runs tests using Vitest.

## 6. Coding Standards

- **Formatting**: The project uses **Prettier**. Run `npm run format` before committing.
- **Linting**: **ESLint** is configured. Ensure no linting errors exist (`npm run lint`).
- **Imports**: Use ES Modules (`import`/`export`) syntax for both frontend and backend.
- **File Naming**:
    - React Components: `PascalCase.jsx` (e.g., `GridCalculator.jsx`)
    - Utilities/Scripts: `camelCase.js` (e.g., `numerologyUtils.js`)
