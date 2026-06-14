#!/usr/bin/env node
/**
 * Injects CACHE_NAME into public/sw.js from git sha or timestamp.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const swPath = join(root, "../public/sw.js");

let version = "dev";
try {
  version = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  version = String(Date.now());
}

const cacheName = `receptbok-${version}`;
const source = readFileSync(swPath, "utf8");
const next = source.replace(
  /const CACHE_NAME = "receptbok-[^"]+";/,
  `const CACHE_NAME = "${cacheName}";`
);

writeFileSync(swPath, next);
console.log(`sw.js CACHE_NAME → ${cacheName}`);
