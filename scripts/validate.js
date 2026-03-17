const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

// ── Load schemas ────────────────────────────────────────────
const packageSchema = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../schemas/plugin-package.schema.json"),
    "utf-8"
  )
);
const versionsSchema = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../schemas/versions.schema.json"),
    "utf-8"
  )
);

// ── Set up Ajv ──────────────────────────────────────────────
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validatePackage = ajv.compile(packageSchema);
const validateVersions = ajv.compile(versionsSchema);

// ── Discover plugin directories ─────────────────────────────
const pluginsDir = path.resolve(__dirname, "../plugins");
const pluginDirs = fs
  .readdirSync(pluginsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "template");

if (pluginDirs.length === 0) {
  console.log("ℹ  No plugin directories found (excluding template). Nothing to validate.");
  process.exit(0);
}

// ── Validate each plugin ────────────────────────────────────
let hasErrors = false;

for (const dir of pluginDirs) {
  const pluginPath = path.join(pluginsDir, dir.name);
  const pkgPath = path.join(pluginPath, "package.json");
  const versPath = path.join(pluginPath, "versions.json");

  console.log(`\n── Validating: plugins/${dir.name}`);

  // ── package.json ──
  if (!fs.existsSync(pkgPath)) {
    console.error(`   ✗ package.json is missing`);
    hasErrors = true;
  } else {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const valid = validatePackage(pkg);
      if (valid) {
        console.log(`   ✓ package.json is valid`);
      } else {
        console.error(`   ✗ package.json validation errors:`);
        for (const err of validatePackage.errors) {
          console.error(`     - ${err.instancePath || "/"}: ${err.message}`);
        }
        hasErrors = true;
      }
    } catch (e) {
      console.error(`   ✗ package.json is not valid JSON: ${e.message}`);
      hasErrors = true;
    }
  }

  // ── versions.json ──
  if (!fs.existsSync(versPath)) {
    console.error(`   ✗ versions.json is missing`);
    hasErrors = true;
  } else {
    try {
      const vers = JSON.parse(fs.readFileSync(versPath, "utf-8"));
      const valid = validateVersions(vers);
      if (valid) {
        console.log(`   ✓ versions.json is valid`);

        // Cross-check: latest version must exist in versions object
        if (!vers.versions[vers.latest]) {
          console.error(
            `   ✗ versions.json: "latest" is "${vers.latest}" but no matching entry exists in "versions"`
          );
          hasErrors = true;
        }
      } else {
        console.error(`   ✗ versions.json validation errors:`);
        for (const err of validateVersions.errors) {
          console.error(`     - ${err.instancePath || "/"}: ${err.message}`);
        }
        hasErrors = true;
      }
    } catch (e) {
      console.error(`   ✗ versions.json is not valid JSON: ${e.message}`);
      hasErrors = true;
    }
  }
}

// ── Exit ────────────────────────────────────────────────────
console.log("");
if (hasErrors) {
  console.error("✗ Validation failed. Please fix the errors above.");
  process.exit(1);
} else {
  console.log("✓ All plugins passed validation.");
  process.exit(0);
}
