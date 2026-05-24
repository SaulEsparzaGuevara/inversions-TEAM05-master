#!/usr/bin/env bash
set -euo pipefail

TARGET_PATH="."
FORCE="false"
SKIP_ACTIONS="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_PATH="$2"
      shift 2
      ;;
    --force)
      FORCE="true"
      shift
      ;;
    --skip-actions)
      SKIP_ACTIONS="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: install-diana.sh [--target <path>] [--force] [--skip-actions]"
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIANA_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE_REPO_ROOT="$(cd "$SOURCE_DIANA_ROOT/../../../.." && pwd)"
TARGET_ROOT="$(cd "$TARGET_PATH" 2>/dev/null && pwd || true)"

if [[ -z "$TARGET_ROOT" ]]; then
  mkdir -p "$TARGET_PATH"
  TARGET_ROOT="$(cd "$TARGET_PATH" && pwd)"
fi

TARGET_DRFIC="$TARGET_ROOT/.drfic"
TARGET_DIANA_SDK="$TARGET_DRFIC/diana-sdk"
TARGET_SDK_DIANA="$TARGET_DIANA_SDK/sdk/diana"
TARGET_PROJECTS="$TARGET_DIANA_SDK/projects"
TARGET_MEMORY="$TARGET_DIANA_SDK/memory"

mkdir -p "$TARGET_DRFIC" "$TARGET_DIANA_SDK" "$TARGET_PROJECTS" "$TARGET_MEMORY" "$TARGET_SDK_DIANA"

DRFIC_README="$TARGET_DRFIC/readme.md"
if [[ ! -f "$DRFIC_README" || "$FORCE" == "true" ]]; then
  cat > "$DRFIC_README" <<'EOF'
# DR.FIC Workspace

Estructura base de Diana SDK instalada.
EOF
fi

if [[ "$(cd "$SOURCE_DIANA_ROOT" && pwd)" != "$(cd "$TARGET_SDK_DIANA" && pwd)" ]]; then
  if [[ "$FORCE" == "true" ]]; then
    rsync -a --delete "$SOURCE_DIANA_ROOT/" "$TARGET_SDK_DIANA/"
  else
    rsync -a --ignore-existing "$SOURCE_DIANA_ROOT/" "$TARGET_SDK_DIANA/"
  fi
fi

RADAR_DIR="$TARGET_PROJECTS/knowledge/indexes"
RADAR_FILE="$RADAR_DIR/projects-knowledge-radar.yaml"
mkdir -p "$RADAR_DIR"
if [[ ! -f "$RADAR_FILE" || "$FORCE" == "true" ]]; then
  cat > "$RADAR_FILE" <<'EOF'
version: 1.0.0
scope: projects-root
last_updated: 2026-04-29

policy:
  always_on_radar:
    - projects-root
    - project-active
  optional_layers:
    - sdk-shared

projects: []
EOF
fi

if [[ "$SKIP_ACTIONS" == "false" ]]; then
  mkdir -p "$TARGET_ROOT/.github/prompts" "$TARGET_ROOT/.github/agents"

  if [[ -d "$SOURCE_REPO_ROOT/.github/prompts" ]]; then
    for f in "$SOURCE_REPO_ROOT"/.github/prompts/diana.*.prompt.md; do
      [[ -e "$f" ]] || continue
      dest="$TARGET_ROOT/.github/prompts/$(basename "$f")"
      if [[ ! -f "$dest" || "$FORCE" == "true" ]]; then
        cp -f "$f" "$dest"
      fi
    done
  fi

  if [[ -d "$SOURCE_REPO_ROOT/.github/agents" ]]; then
    for f in "$SOURCE_REPO_ROOT"/.github/agents/diana.*.agent.md; do
      [[ -e "$f" ]] || continue
      dest="$TARGET_ROOT/.github/agents/$(basename "$f")"
      if [[ ! -f "$dest" || "$FORCE" == "true" ]]; then
        cp -f "$f" "$dest"
      fi
    done
  fi
fi

echo "Diana SDK instalado correctamente en: $TARGET_ROOT"
echo "- Core SDK: .drfic/diana-sdk/sdk/diana"
echo "- Radar base: .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml"
if [[ "$SKIP_ACTIONS" == "false" ]]; then
  echo "- Acciones Diana: .github/prompts y .github/agents"
fi
