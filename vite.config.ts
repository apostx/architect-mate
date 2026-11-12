import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version: string;
};

export default defineConfig({
  // Relative asset URLs, so the build works under any path (GitHub Pages serves it from
  // /architect-mate/).
  base: "./",
  plugins: [react()],
  resolve: {
    // SolutionValidator is installed from its release tag's source tarball (it is not on npm
    // yet), so it is built from source. See docs/design.md, "SolutionValidator dependency".
    alias: [
      {
        find: /^solution-validator\/packs\/(.*)$/,
        replacement: fileURLToPath(
          new URL("./node_modules/solution-validator/src/packs/$1.ts", import.meta.url),
        ),
      },
      {
        find: /^solution-validator$/,
        replacement: fileURLToPath(
          new URL("./node_modules/solution-validator/src/index.ts", import.meta.url),
        ),
      },
    ],
  },
  define: {
    // release-please keeps the version in package.json; the app shows it.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
