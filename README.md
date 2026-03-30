# Citadel Marketplace

The central plugin registry for the Citadel application. This repository stores **metadata only** — plugin source code lives in each builder's own repository. The Citadel app reads this registry to populate the marketplace and install pre-bundled plugins at runtime.

---

## Available Plugins

<!-- PLUGINS_START -->
| Plugin Name | ID | Author | Description | Version |
| :--- | :--- | :--- | :--- | :--- |
| **[Code Module](./directory/@citadel-app/code)** | `@citadel-app/code` | Citadel Team | Code editing, LSP, LaTeX compilation, and interactive REPL for Citadel. | `1.2.1` |
| **[RSS Reader](./directory/@citadel-app/rss)** | `@citadel-app/rss` | Citadel Team | Native RSS feed reading and aggregation for Citadel. | `1.1.5` |
| **[Whiteboard](./directory/@citadel-app/excalidraw)** | `@citadel-app/excalidraw` | Citadel Team | Whiteboard and diagramming with Excalidraw for Citadel. | `1.2.1` |
| **[YouTube Scrolls](./directory/@citadel-app/youtube)** | `@citadel-app/youtube` | Citadel Team | YouTube Plugin for Citadel App | `1.1.5` |
<!-- PLUGINS_END -->

---

## How to Submit a New Plugin

1. **Fork this repository**.
2. **Copy** `plugins/.template/` to `plugins/<your-plugin-id>/`.
3. **Configure your files**:

| File | What to do |
| :--- | :--- |
| `package.json` | Set `name`, `version`, `author`, `description`, `repository.url`. Set `engines.citadel` to the minimum compatible Citadel version (semver range). Configure the `citadel` object with `title`, `icon`, and `bundleUrl`. |
| `versions.json` | Add an entry for each published version with `bundleUrl`, `releasedAt`, `changelog`, and `citadelVersionRange`. Update `latest` to match the newest version. |
| `assets/` | Add your plugin icon (`icon.png`, recommended 256x256). |
| `README.md` | Document your plugin's features and usage. |

4. **Update the Plugins Table** below (keep it alphabetical).
5. **Submit a Pull Request**.

### Publishing a New Version

When releasing a new version of an existing plugin:

1. Add a new entry to `versions.json` with the version key, `bundleUrl`, `changelog`, `releasedAt`, and `citadelVersionRange`.
2. Update `versions.json` → `latest` to the new version string.
3. Update `package.json` → `version` and `engines.citadel` to match the latest release.
4. Submit a PR.
