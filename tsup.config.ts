import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  // CodeMirror and Lezer must never be bundled: a second copy of
  // @lezer/common gets its own NodeProp ids and highlighting silently
  // degrades to plain text. They are peer dependencies, resolved by the host.
  external: [/^@codemirror\//, /^@lezer\//],
})
