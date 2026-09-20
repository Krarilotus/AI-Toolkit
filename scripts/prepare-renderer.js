"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const target = path.join(root, "src/vendor/pixi");
fs.mkdirSync(target, { recursive: true });
for (const [source, name] of [
  ["dist/pixi.min.js", "pixi.min.js"],
  ["dist/packages/unsafe-eval.min.js", "csp.min.js"],
  ["LICENSE", "LICENSE"],
]) {
  fs.copyFileSync(
    path.join(root, "node_modules/pixi.js", source),
    path.join(target, name),
  );
}
