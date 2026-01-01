import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://watchinglog.local",
  srcDir: "./src",
  output: "static",
  markdown: {
    shikiConfig: {
      theme: "poimandres"
    }
  }
});
