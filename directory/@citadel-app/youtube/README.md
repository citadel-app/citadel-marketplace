# YouTube Scrolls

YouTube Plugin for Citadel App

## Directory Contents

| File | Purpose |
| :--- | :--- |
| `package.json` | Plugin metadata (name, version, author) + Citadel-specific config. The `version` field must always match the `latest` entry in `versions.json`. |
| `versions.json` | Full version history. Each entry includes a `bundleUrl`, `changelog`, release date, and `citadelVersionRange` for compatibility. |
| `assets/` | Branding assets (e.g., `icon.png`, recommended 256x256). |

## How to Configure

### 1. Update `package.json`
- Provide standard fields: `name`, `version`, `author`, `description`.
- Set `repository.url` to your source code repository.
- Set `engines.citadel` to the minimum Citadel version your **latest** release supports (e.g., `">=2.0.0"`).
- Configure the `citadel` object with your `title`, `icon` path, and `bundleUrl`.

### 2. Set up `versions.json`
When you publish a new version:
1. Add a new entry under `versions` keyed by the version string.
2. Include `bundleUrl`, `releasedAt`, `changelog`, and `citadelVersionRange`.
3. Update the `latest` field to the new version.
4. Also update the `version` field in `package.json` to match.

### 3. Bundling Requirement
Your actual plugin must be pre-bundled (using `esbuild`, `webpack`, etc.) and published as a `.zip` or `.js` file to your GitHub Releases. The `bundleUrl` in both `package.json` and `versions.json` must point to those release artifacts.

## How the Citadel App Uses This

1. Reads `package.json` for display info (name, description, icon).
2. Checks `engines.citadel` for a quick compatibility check against the latest version.
3. Reads `versions.json` to find the best compatible version for the user's Citadel installation.
4. Downloads the bundle from the matching `bundleUrl`.
