import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Vitest ignores vite.config.mts, so the automatic JSX runtime has to be
  // enabled here too or .jsx components compile to React.createElement.
  plugins: [react()],
  test: {
    environment: "happy-dom",
  },
});
