/**
 * generate-agent-files.ts
 * Reads a project-type template from kecku_standard_harness/templates/<type>/,
 * replaces {{...}} placeholders with values from detect-stack output,
 * and writes AGENTS.md, CLAUDE.md, and docs/harness/ files to the target repo.
 *
 * Usage:
 *   npx tsx generate-agent-files.ts [options]
 *
 * Options:
 *   --project-type <type>   frontend|backend|fullstack|mobile|embedded|internal|research
 *                           Default: detect-stack projectTypeHint, then "internal"
 *   --out <dir>             Output directory (default: cwd)
 *   --risk <level>          R0|R1|R2|R3|R4 (default: R1)
 *   --force                 Overwrite existing files (default: skip existing with warning)
 *   --dry-run               Print diff as JSON; do not write files
 *   --detect-json <path>    Use this JSON file instead of running detect-stack.ts
 *
 * Node built-ins only — no external dependencies.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function flag(name: string): boolean {
  return args.includes(name);
}

function option(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const outDir = resolve(option("--out") ?? process.cwd());
const riskLevel = option("--risk") ?? "R1";
const forceOverwrite = flag("--force");
const dryRun = flag("--dry-run");
const detectJsonPath = option("--detect-json");
let projectTypeArg = option("--project-type");

const VALID_TYPES = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "embedded",
  "internal",
  "research",
  "minimal",
] as const;
type ProjectType = (typeof VALID_TYPES)[number];

// ---------------------------------------------------------------------------
// Safety check: refuse to write inside kecku_standard_harness/
// ---------------------------------------------------------------------------
const thisFile = resolve(__filename);
const harnessDirGuess = resolve(thisFile, "../../../../");
if (outDir.startsWith(harnessDirGuess + "/") || outDir === harnessDirGuess) {
  console.error(
    "ERROR: --out points inside kecku_standard_harness/. Aborting to prevent self-contamination."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load detect-stack output
// ---------------------------------------------------------------------------
interface StackInfo {
  packageManager: string;
  languages: string[];
  frameworks: string[];
  verifyCommands: string[];
  ciSystems: string[];
  projectTypeHint: string | null;
  hasDocker: boolean;
  hasMobileHints: boolean;
  hasEmbeddedHints: boolean;
}

let stackInfo: StackInfo;

if (detectJsonPath) {
  stackInfo = JSON.parse(readFileSync(resolve(detectJsonPath), "utf8"));
} else {
  const detectScript = join(__dirname, "detect-stack.ts");
  const result = spawnSync(
    "npx",
    ["tsx", detectScript],
    { cwd: outDir, encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(
      "ERROR: detect-stack.ts failed.\n" + (result.stderr ?? result.error?.message)
    );
    process.exit(1);
  }
  stackInfo = JSON.parse(result.stdout);
}

// ---------------------------------------------------------------------------
// Resolve project type
// ---------------------------------------------------------------------------
if (!projectTypeArg) {
  projectTypeArg = stackInfo.projectTypeHint ?? "internal";
}

if (!VALID_TYPES.includes(projectTypeArg as ProjectType)) {
  console.error(
    `ERROR: Unknown project type "${projectTypeArg}". Valid: ${VALID_TYPES.join(", ")}`
  );
  process.exit(1);
}
const projectType = projectTypeArg as ProjectType;

// ---------------------------------------------------------------------------
// Locate template directory
// ---------------------------------------------------------------------------
// This script lives at: skills/kecku-harness-bootstrap/scripts/generate-agent-files.ts
// Templates are at:     templates/<type>/
const harnessSrcDir = resolve(__dirname, "../../../");
const templateDir = join(harnessSrcDir, "templates", projectType);

if (!existsSync(templateDir)) {
  console.error(`ERROR: Template directory not found: ${templateDir}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build placeholder values
// ---------------------------------------------------------------------------
const detectedDate = new Date().toISOString().slice(0, 10);

const verifyCommandsBlock =
  stackInfo.verifyCommands.length > 0
    ? stackInfo.verifyCommands.join("\n")
    : "# No commands detected. Add your verify commands here.";

const projectTypeLabel = buildProjectTypeLabel(projectType, stackInfo);

function buildProjectTypeLabel(type: string, info: StackInfo): string {
  const parts: string[] = [type];
  const fw = info.frameworks.slice(0, 3);
  const lang = info.languages.slice(0, 2);
  if (fw.length > 0) parts.push(fw.join(" / "));
  else if (lang.length > 0) parts.push(lang.join(" / "));
  return parts.join(" — ");
}

const placeholders: Record<string, string> = {
  "{{PROJECT_TYPE}}": projectTypeLabel,
  "{{VERIFY_COMMANDS}}": verifyCommandsBlock,
  "{{RISK_LEVEL}}": riskLevel,
  "{{DETECTED_DATE}}": detectedDate,
  // legacy keys from minimal template
  "{{DATE}}": detectedDate,
  "R{{LEVEL}}": riskLevel,
};

function applyPlaceholders(content: string): string {
  let result = content;
  for (const [key, val] of Object.entries(placeholders)) {
    result = result.split(key).join(val);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Collect template files recursively
// ---------------------------------------------------------------------------
interface FileEntry {
  templatePath: string; // absolute path in template dir
  outPath: string;      // absolute path in output dir
  relPath: string;      // relative to outDir, for display
}

function collectFiles(dir: string, base: string): FileEntry[] {
  const entries: FileEntry[] = [];
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);
    const relFromTemplate = relative(base, fullPath);
    const outPath = join(outDir, relFromTemplate);
    if (statSync(fullPath).isDirectory()) {
      entries.push(...collectFiles(fullPath, base));
    } else {
      entries.push({
        templatePath: fullPath,
        outPath,
        relPath: relFromTemplate,
      });
    }
  }
  return entries;
}

const templateFiles = collectFiles(templateDir, templateDir);

// ---------------------------------------------------------------------------
// Process files
// ---------------------------------------------------------------------------
interface DryRunEntry {
  path: string;
  status: "write" | "skip" | "overwrite";
  content: string;
}

const dryRunOutput: DryRunEntry[] = [];
const written: string[] = [];
const skipped: string[] = [];

for (const entry of templateFiles) {
  const raw = readFileSync(entry.templatePath, "utf8");
  const processed = applyPlaceholders(raw);

  if (dryRun) {
    const status = existsSync(entry.outPath)
      ? forceOverwrite
        ? "overwrite"
        : "skip"
      : "write";
    dryRunOutput.push({ path: entry.relPath, status, content: processed });
    continue;
  }

  if (existsSync(entry.outPath) && !forceOverwrite) {
    skipped.push(entry.relPath);
    process.stderr.write(`SKIP (exists, use --force to overwrite): ${entry.relPath}\n`);
    continue;
  }

  mkdirSync(dirname(entry.outPath), { recursive: true });
  writeFileSync(entry.outPath, processed, "utf8");
  written.push(entry.relPath);
}

// ---------------------------------------------------------------------------
// Auto-append HARNESS_HEALTH.md gap when no verify commands found
// ---------------------------------------------------------------------------
if (!dryRun && stackInfo.verifyCommands.length === 0) {
  const healthPath = join(outDir, "docs/harness/HARNESS_HEALTH.md");
  if (existsSync(healthPath)) {
    const content = readFileSync(healthPath, "utf8");
    const gapLine = `| ${detectedDate} | No automated test command | Cannot verify repo changes programmatically | Define verify commands in package.json/Makefile/pyproject.toml | Open |`;
    if (!content.includes("No automated test command")) {
      const updated = content.replace(
        /(\| Date \| Gap \|.*\n\|[-| ]+\|)\n/,
        `$1\n${gapLine}\n`
      );
      writeFileSync(healthPath, updated, "utf8");
      written.push("docs/harness/HARNESS_HEALTH.md (gap appended)");
    }
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, projectType, riskLevel, outDir, files: dryRunOutput }, null, 2));
} else {
  const summary = {
    projectType,
    riskLevel,
    outDir,
    detectedStack: {
      packageManager: stackInfo.packageManager,
      languages: stackInfo.languages,
      frameworks: stackInfo.frameworks,
      verifyCommands: stackInfo.verifyCommands,
      ciSystems: stackInfo.ciSystems,
    },
    written,
    skipped,
  };
  console.log(JSON.stringify(summary, null, 2));
}
