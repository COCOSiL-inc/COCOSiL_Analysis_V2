/**
 * generate-cursor-rules.ts
 *
 * Generates .cursor/rules/project.mdc for a target repository by copying
 * the product-type-specific template from templates/<type>/.cursor/rules/project.mdc
 * and applying {{...}} placeholder substitution.
 *
 * Use this script when:
 *   - Adding Cursor rules to a repo that already has AGENTS.md / CLAUDE.md
 *   - Refreshing Cursor rules after a product-type change
 *
 * For initial harness setup, prefer generate-agent-files.ts which also
 * generates .cursor/rules/project.mdc via recursive template copy.
 *
 * Usage:
 *   npx tsx generate-cursor-rules.ts [options]
 *
 * Options:
 *   --project-type <type>   frontend|backend|fullstack|mobile|embedded|internal|research|minimal
 *                           Default: "internal"
 *   --out <dir>             Output directory (default: cwd)
 *   --risk <level>          R0|R1|R2|R3|R4 (default: R1)
 *   --force                 Overwrite existing file (default: skip with warning)
 *   --dry-run               Print what would be written; do not write files
 *
 * Node built-ins only — no external dependencies.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

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

const projectTypeArg = option("--project-type") ?? "internal";

if (!VALID_TYPES.includes(projectTypeArg as ProjectType)) {
  console.error(
    `ERROR: Unknown project type "${projectTypeArg}". Valid: ${VALID_TYPES.join(", ")}`
  );
  process.exit(1);
}
const projectType = projectTypeArg as ProjectType;

// ---------------------------------------------------------------------------
// Safety check: refuse to write inside kecku_standard_harness/
// ---------------------------------------------------------------------------
const thisFile = resolve(new URL(import.meta.url).pathname);
// scripts/ -> kecku-harness-bootstrap/ -> skills/ -> kecku_standard_harness/
const harnessDirGuess = resolve(thisFile, "../../../../");
if (outDir.startsWith(harnessDirGuess + "/") || outDir === harnessDirGuess) {
  console.error(
    "ERROR: --out points inside kecku_standard_harness/. Aborting to prevent self-contamination."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Locate template file
// ---------------------------------------------------------------------------
// scripts/ -> kecku-harness-bootstrap/ -> skills/ -> kecku_standard_harness/
const harnessSrcDir = resolve(thisFile, "../../../../");
const templateFile = join(
  harnessSrcDir,
  "templates",
  projectType,
  ".cursor",
  "rules",
  "project.mdc"
);

if (!existsSync(templateFile)) {
  console.error(`ERROR: Template not found: ${templateFile}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Placeholder substitution
// ---------------------------------------------------------------------------
const detectedDate = new Date().toISOString().slice(0, 10);

const placeholders: Record<string, string> = {
  "{{PROJECT_TYPE}}": projectType,
  "{{RISK_LEVEL}}": riskLevel,
  "{{DETECTED_DATE}}": detectedDate,
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

const raw = readFileSync(templateFile, "utf8");
const processed = applyPlaceholders(raw);

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------
const outRelPath = ".cursor/rules/project.mdc";
const outFilePath = join(outDir, outRelPath);

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        projectType,
        riskLevel,
        outDir,
        file: {
          path: outRelPath,
          status: existsSync(outFilePath)
            ? forceOverwrite
              ? "overwrite"
              : "skip"
            : "write",
          content: processed,
        },
      },
      null,
      2
    )
  );
  process.exit(0);
}

if (existsSync(outFilePath) && !forceOverwrite) {
  process.stderr.write(
    `SKIP (already exists, use --force to overwrite): ${outRelPath}\n`
  );
  console.log(
    JSON.stringify({ projectType, riskLevel, outDir, written: [], skipped: [outRelPath] })
  );
  process.exit(0);
}

mkdirSync(dirname(outFilePath), { recursive: true });
writeFileSync(outFilePath, processed, "utf8");

console.log(
  JSON.stringify({
    projectType,
    riskLevel,
    outDir,
    written: [outRelPath],
    skipped: [],
  })
);
