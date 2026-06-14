import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  {
    ignores: [
      "storybook-static/**",
      "test-results/**",
      "playwright-report/**",
      ".netlify/**",
    ],
  },
  ...nextVitals,
]);
