import { defineConfig, loadEnv } from "vite";

import solid from "solid-start";

console.log(process.env);
export default defineConfig({
  plugins: [solid()]
});
