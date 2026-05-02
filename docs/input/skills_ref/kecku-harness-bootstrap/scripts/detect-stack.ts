/**
 * detect-stack.ts
 * Inspects the current working directory and outputs a JSON summary of the
 * project's tech stack, verify commands, CI systems, and a project-type hint.
 *
 * Usage:  npx tsx detect-stack.ts
 * Output: JSON to stdout
 *
 * Node built-ins only — no external dependencies.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();

function exists(rel: string): boolean {
  return existsSync(join(cwd, rel));
}

function read(rel: string): string | null {
  try {
    return readFileSync(join(cwd, rel), "utf8");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Package manager
// ---------------------------------------------------------------------------
let packageManager = "unknown";
if (exists("pnpm-lock.yaml")) packageManager = "pnpm";
else if (exists("yarn.lock")) packageManager = "yarn";
else if (exists("package-lock.json")) packageManager = "npm";
else if (exists("poetry.lock")) packageManager = "poetry";
else if (exists("uv.lock")) packageManager = "uv";
else if (exists("pdm.lock")) packageManager = "pdm";
else if (exists("go.mod")) packageManager = "go-mod";
else if (exists("Cargo.toml")) packageManager = "cargo";
else if (exists("requirements.txt") || exists("setup.py") || exists("setup.cfg"))
  packageManager = "pip";

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------
const languages: string[] = [];

if (exists("package.json")) {
  const pkg = JSON.parse(read("package.json")!);
  const allDeps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };
  if (exists("tsconfig.json") || "typescript" in allDeps) {
    languages.push("ts");
  } else {
    languages.push("js");
  }
}

if (
  exists("pyproject.toml") ||
  exists("requirements.txt") ||
  exists("setup.py") ||
  exists("setup.cfg")
) {
  languages.push("python");
}

if (exists("go.mod")) languages.push("go");
if (exists("Cargo.toml")) languages.push("rust");

// ---------------------------------------------------------------------------
// Framework detection
// ---------------------------------------------------------------------------
const frameworks: string[] = [];

if (exists("package.json")) {
  const pkg = JSON.parse(read("package.json")!);
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  const fwMap: Record<string, string> = {
    next: "next",
    vite: "vite",
    nuxt: "nuxt",
    "@remix-run/react": "remix",
    remix: "remix",
    "@nestjs/core": "nest",
    express: "express",
    hono: "hono",
    fastify: "fastify",
    "react-native": "react-native",
    expo: "expo",
    "@tauri-apps/api": "tauri",
    "@tauri-apps/cli": "tauri",
  };
  for (const [dep, fw] of Object.entries(fwMap)) {
    if (dep in deps && !frameworks.includes(fw)) frameworks.push(fw);
  }
}

if (languages.includes("python")) {
  const combined =
    (read("pyproject.toml") ?? "") + (read("requirements.txt") ?? "");
  if (/\bdjango\b/i.test(combined)) frameworks.push("django");
  if (/\bfastapi\b/i.test(combined)) frameworks.push("fastapi");
  if (/\bflask\b/i.test(combined)) frameworks.push("flask");
}

if (languages.includes("go")) {
  const gomod = read("go.mod") ?? "";
  if (gomod.includes("github.com/labstack/echo")) frameworks.push("echo");
  if (gomod.includes("github.com/gin-gonic/gin")) frameworks.push("gin");
}

if (languages.includes("rust")) {
  const cargo = read("Cargo.toml") ?? "";
  if (cargo.includes("actix-web")) frameworks.push("actix");
  if (cargo.includes("axum")) frameworks.push("axum");
}

// ---------------------------------------------------------------------------
// CI systems
// ---------------------------------------------------------------------------
const ciSystems: string[] = [];
if (exists(".github/workflows")) ciSystems.push(".github/workflows");
if (exists(".gitlab-ci.yml")) ciSystems.push("gitlab-ci");
if (exists(".circleci/config.yml")) ciSystems.push("circleci");
if (exists("Makefile")) ciSystems.push("makefile");

// ---------------------------------------------------------------------------
// Verify commands (only commands that provably exist in config files)
// ---------------------------------------------------------------------------
const verifyCommands: string[] = [];

if (exists("package.json")) {
  const pkg = JSON.parse(read("package.json")!);
  const scripts: Record<string, string> = pkg.scripts ?? {};
  const pm =
    packageManager === "pnpm"
      ? "pnpm"
      : packageManager === "yarn"
      ? "yarn"
      : "npm run";

  for (const key of ["test", "build", "lint", "typecheck", "format", "check"]) {
    if (key in scripts) verifyCommands.push(`${pm} ${key}`);
  }
}

if (languages.includes("go")) {
  verifyCommands.push("go test ./...");
  verifyCommands.push("go build ./...");
  if (exists(".golangci.yml") || exists(".golangci.yaml")) {
    verifyCommands.push("golangci-lint run");
  }
}

if (languages.includes("rust")) {
  verifyCommands.push("cargo test");
  verifyCommands.push("cargo build");
  if (exists("clippy.toml") || exists(".cargo/config.toml")) {
    verifyCommands.push("cargo clippy");
  }
}

if (languages.includes("python") && !exists("package.json")) {
  const pyproj = read("pyproject.toml") ?? "";
  const req = read("requirements.txt") ?? "";
  if (/\bpytest\b/.test(pyproj + req)) verifyCommands.push("pytest");
  if (/\bruff\b/.test(pyproj)) verifyCommands.push("ruff check .");
  if (/\bmypy\b/.test(pyproj)) verifyCommands.push("mypy .");
}

// Extract Makefile targets matching test|build|lint|check|format
if (exists("Makefile")) {
  const makefile = read("Makefile")!;
  const targetRe = /^([a-zA-Z][a-zA-Z0-9_-]*):/gm;
  let m: RegExpExecArray | null;
  while ((m = targetRe.exec(makefile)) !== null) {
    const name = m[1];
    if (/^(test|build|lint|check|format)$/.test(name)) {
      const cmd = `make ${name}`;
      if (!verifyCommands.includes(cmd)) verifyCommands.push(cmd);
    }
  }
}

// ---------------------------------------------------------------------------
// Mobile hints
// ---------------------------------------------------------------------------
const hasMobileHints =
  exists("Podfile") ||
  exists("android") ||
  exists("ios") ||
  frameworks.includes("react-native") ||
  frameworks.includes("expo");

// ---------------------------------------------------------------------------
// Embedded hints
// ---------------------------------------------------------------------------
let hasEmbeddedHints = false;
if (languages.includes("rust")) {
  const cargo = read("Cargo.toml") ?? "";
  if (cargo.includes("no_std")) hasEmbeddedHints = true;
}
if (
  exists("platformio.ini") ||
  exists("sdkconfig") ||
  exists("CMakeLists.txt")
) {
  hasEmbeddedHints = true;
}

// ---------------------------------------------------------------------------
// Project type hint (low confidence — human or generate script makes final call)
// ---------------------------------------------------------------------------
const frontendFws = ["next", "vite", "nuxt", "remix"];
const backendFws = ["nest", "express", "fastapi", "django", "flask", "echo", "gin", "actix", "axum", "hono", "fastify"];
const isFrontend = frameworks.some((f) => frontendFws.includes(f));
const isBackend = frameworks.some((f) => backendFws.includes(f));

let projectTypeHint: string | null = null;

if (hasEmbeddedHints) {
  projectTypeHint = "embedded";
} else if (hasMobileHints) {
  projectTypeHint = "mobile";
} else if (isFrontend && isBackend) {
  projectTypeHint = "fullstack";
} else if (isFrontend) {
  projectTypeHint = "frontend";
} else if (isBackend) {
  projectTypeHint = "backend";
} else if (languages.includes("python") && frameworks.length === 0) {
  projectTypeHint = "research";
} else if (languages.length > 0) {
  projectTypeHint = "internal";
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const result = {
  packageManager,
  languages,
  frameworks,
  verifyCommands,
  ciSystems,
  projectTypeHint,
  hasDocker:
    exists("Dockerfile") ||
    exists("docker-compose.yml") ||
    exists("compose.yml"),
  hasMobileHints,
  hasEmbeddedHints,
};

console.log(JSON.stringify(result, null, 2));
