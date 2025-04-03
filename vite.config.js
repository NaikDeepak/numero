/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use Vitest globals (describe, it, expect) without importing
    environment: "jsdom", // Simulate browser environment for React components (optional for utils)
    // Optional: Setup files, coverage configuration, etc.
    // setupFiles: './src/setupTests.js',
  },
});
