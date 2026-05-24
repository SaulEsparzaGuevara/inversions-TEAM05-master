from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path


def _copy_tree(src: Path, dst: Path, force: bool) -> None:
    if not src.exists():
        return
    for item in src.rglob("*"):
        rel = item.relative_to(src)
        target = dst / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        if force or not target.exists():
            shutil.copy2(item, target)


def _copy_pattern(src_dir: Path, dst_dir: Path, pattern: str, force: bool) -> None:
    if not src_dir.exists():
        return
    dst_dir.mkdir(parents=True, exist_ok=True)
    for item in src_dir.glob(pattern):
        if not item.is_file():
            continue
        target = dst_dir / item.name
        if force or not target.exists():
            shutil.copy2(item, target)


def _is_valid_assets_root(assets_root: Path) -> bool:
    core = assets_root / "drfic" / "diana-sdk" / "sdk" / "diana"
    prompts = assets_root / "github" / "prompts"
    agents = assets_root / "github" / "agents"
    return core.exists() and prompts.exists() and agents.exists()


def _resolve_assets_root() -> Path:
    env_override = os.getenv("DIANA_SDK_ASSETS_DIR")
    candidates: list[Path] = []
    if env_override:
        candidates.append(Path(env_override).expanduser().resolve())

    module_file = Path(__file__).resolve()
    module_dir = module_file.parent

    # Support editable/source layout and uvx wheel layout.
    candidates.append(module_dir / "assets")
    for parent in module_file.parents:
        candidates.append(parent / "assets")

    seen: set[Path] = set()
    unique_candidates: list[Path] = []
    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        unique_candidates.append(candidate)

    for assets_root in unique_candidates:
        if _is_valid_assets_root(assets_root):
            return assets_root

    searched = "\n".join(f"- {p}" for p in unique_candidates)
    raise FileNotFoundError(
        "No se encontraron assets del instalador Diana SDK. "
        "Rutas verificadas:\n"
        f"{searched}\n\n"
        "Asegura que el paquete incluya la carpeta assets/ o define DIANA_SDK_ASSETS_DIR."
    )


def _init_project(target: Path, force: bool, skip_actions: bool) -> int:
    assets_root = _resolve_assets_root()

    src_diana = assets_root / "drfic" / "diana-sdk" / "sdk" / "diana"
    src_prompts = assets_root / "github" / "prompts"
    src_agents = assets_root / "github" / "agents"

    drfic = target / ".drfic"
    diana_sdk = drfic / "diana-sdk"
    sdk_diana = diana_sdk / "sdk" / "diana"
    projects = diana_sdk / "projects"
    memory = diana_sdk / "memory"

    drfic.mkdir(parents=True, exist_ok=True)
    diana_sdk.mkdir(parents=True, exist_ok=True)
    projects.mkdir(parents=True, exist_ok=True)
    memory.mkdir(parents=True, exist_ok=True)
    sdk_diana.mkdir(parents=True, exist_ok=True)

    drfic_readme = drfic / "readme.md"
    if force or not drfic_readme.exists():
        drfic_readme.write_text(
            "# DR.FIC Workspace\n\nEstructura base de Diana SDK instalada.\n",
            encoding="utf-8",
        )

    _copy_tree(src_diana, sdk_diana, force=force)

    radar = projects / "knowledge" / "indexes" / "projects-knowledge-radar.yaml"
    radar.parent.mkdir(parents=True, exist_ok=True)
    if force or not radar.exists():
        radar.write_text(
            "version: 1.0.0\n"
            "scope: projects-root\n"
            "last_updated: 2026-04-29\n\n"
            "policy:\n"
            "  always_on_radar:\n"
            "    - projects-root\n"
            "    - project-active\n"
            "  optional_layers:\n"
            "    - sdk-shared\n\n"
            "projects: []\n",
            encoding="utf-8",
        )

    if not skip_actions:
        _copy_pattern(src_prompts, target / ".github" / "prompts", "diana.*.prompt.md", force=force)
        _copy_pattern(src_agents, target / ".github" / "agents", "diana.*.agent.md", force=force)

    if not any(sdk_diana.iterdir()):
        print("Error: No se copio el core Diana SDK en .drfic/diana-sdk/sdk/diana")
        return 1

    print(f"Diana SDK instalado correctamente en: {target}")
    print("- Core SDK: .drfic/diana-sdk/sdk/diana")
    print("- Radar base: .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml")
    if not skip_actions:
        print("- Acciones Diana: .github/prompts y .github/agents")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(prog="diana", description="DR.FIC Diana SDK CLI")
    subparsers = parser.add_subparsers(dest="command")

    init_parser = subparsers.add_parser("init", help="Inicializa Diana SDK en un proyecto")
    init_parser.add_argument("--target", default=".", help="Ruta destino del proyecto")
    init_parser.add_argument("--force", action="store_true", help="Sobrescribir archivos existentes")
    init_parser.add_argument(
        "--skip-actions",
        action="store_true",
        help="No copiar acciones Diana en .github/prompts y .github/agents",
    )

    args = parser.parse_args()

    if args.command == "init":
        target = Path(args.target).resolve()
        target.mkdir(parents=True, exist_ok=True)
        return _init_project(target=target, force=args.force, skip_actions=args.skip_actions)

    parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
