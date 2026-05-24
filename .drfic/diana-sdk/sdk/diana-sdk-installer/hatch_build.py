"""Hatchling build hook to include assets in wheel distribution."""
from hatchling.builders.hooks.plugin.interface import BuildHookInterface
from pathlib import Path
import shutil


class CustomBuildHook(BuildHookInterface):
    """Include assets directory in wheel distribution."""
    
    PLUGIN_NAME = 'custom'
    
    def initialize(self, version, build_data):
        """Called when the build starts."""
        # Ensure assets directory is included in wheel
        project_root = Path(self.root)
        assets_dir = project_root / "assets"
        
        if not assets_dir.exists():
            self.log(f"Warning: assets directory not found at {assets_dir}")
            return
        
        # For wheel builds, add assets to the wheel
        if self.build_target == "wheel":
            # Copy assets to a temporary location that will be included
            wheel_root = Path(self.build_config.get("wheel", {}).get("directory", ".hatch"))
            
            # Actually, the better approach: ensure assets are copied to site-packages
            # This is handled by explicit include in the wheel builder
            self.log(f"Including assets directory: {assets_dir}")
            
            # Add assets to wheel distribution
            if "packages" not in build_data:
                build_data["packages"] = []
            
            # This tells hatchling where to find additional files
            build_data.setdefault("force-include", {})[str(assets_dir)] = "diana_cli-assets"
