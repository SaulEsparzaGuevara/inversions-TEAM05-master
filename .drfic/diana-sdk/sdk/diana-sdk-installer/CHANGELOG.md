# Changelog

All notable changes to this project are documented in this file.

## v0.1.4 - 2026-05-13

### Added
- Added new Diana help action assets:
	- `diana.help.prompt.md`
	- `diana.help.agent.md`
- `diana.help` now provides command syntax guidance, SDD tutorial flow, and sync tutorial.

### Changed
- Installer package now ships the new help assets so students get `/diana.help` after `diana init`.

## v0.1.3 - 2026-05-13

### Added
- Added `diana.sync` prompt and agent into installer assets so `diana init` scaffolds sync guidance in `.github/prompts` and `.github/agents`.
- Added PowerShell utility `.drfic/diana-sdk/sdk/diana/scripts/powershell/diana-sync-team.ps1` to reconcile Speckit task completion into Diana team canonical tasks by explicit mapping.
- Added sync operation docs in SDK scripts README and installer README.

### Changed
- Updated sync policy to preserve Speckit extended tasks (no deletion) while keeping global closure canonical-only.
- Cleaned duplicate sync-extension section in the root `diana.sync` prompt.

## v0.1.2 - 2026-04-30

### Fixed
- **Critical**: Fixed wheel asset packaging using hatchling `force-include` directive to ensure `assets/` directory is distributed in wheel.
- Assets now correctly resolved in uvx cache at `site-packages/assets/drfic/diana-sdk/...`.
- Added MANIFEST.in for explicit asset inclusion support across all build backends.
- Version bumped from 0.1.1 to 0.1.2 (uvx will refresh wheel from new version tag).


## v0.1.1 - 2026-04-30

### Fixed
- Corrected assets resolution for `uvx`/wheel execution so `diana init` can always find bundled assets.
- Fixed missing copy of Diana core (`.drfic/diana-sdk/sdk/diana`) when package is executed outside source-tree layout.
- Fixed missing copy of Diana agents/prompts into `.github/agents` and `.github/prompts` under `uvx` flows.
- Added explicit installer error when core copy fails and support for `DIANA_SDK_ASSETS_DIR` override.

## v0.1.0 - 2026-04-30

### Added
- Initial standalone installer package for Diana SDK.
- Python CLI command: `diana init`.
- Installer options: `--target`, `--force`, and `--skip-actions`.
- Asset packaging for Diana core under `.drfic/diana-sdk/sdk/diana`.
- Automated scaffold for `projects-knowledge-radar.yaml`.
- Bundled Diana prompts and agents copied to `.github/prompts` and `.github/agents`.

### Notes
- First public bootstrap release intended for `uvx`-based initialization flows.
