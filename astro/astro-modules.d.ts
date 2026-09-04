// tsc has no native notion of `.astro` modules (the Astro VS Code extension /
// `astro check` provide component-level types); this ambient declaration lets
// plain `tsc` typecheck imports of `.astro` files (e.g. from the view tests).
// NOTE: no top-level imports here — a d.ts with imports becomes a module and
// its `declare module` would stop being a global ambient declaration.
declare module "*.astro" {
  const Component: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default Component;
}
