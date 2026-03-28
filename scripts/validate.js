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

// ── Discover plugin directories (supports scoped packages) ──
const directoryRoot = path.resolve(__dirname, "../directory");

function findPluginDirs(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "template") continue;
    const fullPath = path.join(dir, entry.name);
    // If this directory has a package.json, it's a plugin
    if (fs.existsSync(path.join(fullPath, "package.json"))) {
      results.push({
        name: path.relative(directoryRoot, fullPath).replace(/\\/g, "/"),
        path: fullPath,
      });
    } else {
      // Otherwise, recurse (handles scoped directories like @citadel-app/)
      findPluginDirs(fullPath, results);
    }
  }
  return results;
}

const pluginDirs = findPluginDirs(directoryRoot);

if (pluginDirs.length === 0) {
  console.log("ℹ  No plugin directories found. Nothing to validate.");
  process.exit(0);
}

// ── Validate each plugin ────────────────────────────────────
let hasErrors = false;

for (const plugin of pluginDirs) {
  const pkgPath = path.join(plugin.path, "package.json");
  const versPath = path.join(plugin.path, "versions.json");

  console.log(`\n── Validating: ${plugin.name}`);

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
