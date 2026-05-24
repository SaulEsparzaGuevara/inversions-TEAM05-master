// FIC: Confluence view presets CRUD routes for user/role-based saved views
// FIC: Rutas CRUD de presets de vista de confluencia para vistas guardadas por usuario/rol

import { Router, Request, Response } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { createAuthenticatedClient } from "../../database/supabase/client.js";

const router = Router();

interface ConfluenceViewPreset {
  id?: string;
  name: string;
  description?: string;
  user_id?: string;
  role?: string;
  is_public?: boolean;
  column_fields: string[];
  column_order: Record<string, number>;
  filters?: Record<string, any>;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  created_at?: string;
  updated_at?: string;
}

// FIC: Create confluence view preset (EN)
// FIC: Crear preset de vista de confluencia (ES)
router.post(
  "/confluence-presets",
  authContextMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.authContext?.token) {
        return res.status(401).json({ error: "AUTH_CONTEXT_MISSING" });
      }
      const supabase = createAuthenticatedClient(req.authContext.token);

      const { name, description, column_fields, column_order, filters, sort_by, sort_order } =
        req.body;
      const userId = req.authContext.userId;
      const userRole = req.authContext.role;

      // FIC: Validate input (EN)
      // FIC: Validar entrada (ES)
      if (!name || !column_fields || !Array.isArray(column_fields)) {
        return res.status(400).json({
          error: "INVALID_PRESET_DATA",
          message: "name and column_fields (array) are required",
        });
      }

      const { data, error } = await supabase
        .from("confluence_view_presets")
        .insert([
          {
            name,
            description,
            user_id: userId,
            role: userRole,
            is_public: false,
            column_fields,
            column_order: column_order || {},
            filters: filters || {},
            sort_by: sort_by || "timestamp",
            sort_order: sort_order || "desc",
          },
        ])
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          error: "PRESET_CREATE_FAILED",
          message: error.message,
        });
      }

      res.status(201).json({
        success: true,
        preset: data,
      });
    } catch (err) {
      res.status(500).json({
        error: "PRESET_CREATE_ERROR",
        message: (err as Error).message,
      });
    }
  }
);

// FIC: List user presets (EN)
// FIC: Listar presets del usuario (ES)
router.get(
  "/confluence-presets",
  authContextMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.authContext?.token) {
        return res.status(401).json({ error: "AUTH_CONTEXT_MISSING" });
      }
      const supabase = createAuthenticatedClient(req.authContext.token);

      const userId = req.authContext.userId;
      const userRole = req.authContext.role;

      // FIC: Get user presets and role-based public presets (EN)
      // FIC: Obtener presets de usuario y presets públicos basados en rol (ES)
      const { data, error } = await supabase
        .from("confluence_view_presets")
        .select("*")
        .or(
          `user_id.eq.${userId},and(is_public.eq.true,role.eq.${userRole})`
        )
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(400).json({
          error: "PRESET_LIST_FAILED",
          message: error.message,
        });
      }

      res.json({
        success: true,
        presets: data || [],
      });
    } catch (err) {
      res.status(500).json({
        error: "PRESET_LIST_ERROR",
        message: (err as Error).message,
      });
    }
  }
);

// FIC: Get preset by ID (EN)
// FIC: Obtener preset por ID (ES)
router.get(
  "/confluence-presets/:id",
  authContextMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.authContext?.token) {
        return res.status(401).json({ error: "AUTH_CONTEXT_MISSING" });
      }
      const supabase = createAuthenticatedClient(req.authContext.token);

      const { id } = req.params;
      const userId = req.authContext.userId;

      const { data, error } = await supabase
        .from("confluence_view_presets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return res.status(404).json({
          error: "PRESET_NOT_FOUND",
          message: "Preset does not exist",
        });
      }

      // FIC: Check access permissions (EN)
      // FIC: Verificar permisos de acceso (ES)
      if (data.user_id !== userId && !data.is_public) {
        return res.status(403).json({
          error: "PRESET_ACCESS_DENIED",
          message: "You do not have access to this preset",
        });
      }

      res.json({
        success: true,
        preset: data,
      });
    } catch (err) {
      res.status(500).json({
        error: "PRESET_GET_ERROR",
        message: (err as Error).message,
      });
    }
  }
);

// FIC: Update preset (owner only) (EN)
// FIC: Actualizar preset (solo propietario) (ES)
router.put(
  "/confluence-presets/:id",
  authContextMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.authContext?.token) {
        return res.status(401).json({ error: "AUTH_CONTEXT_MISSING" });
      }
      const supabase = createAuthenticatedClient(req.authContext.token);

      const { id } = req.params;
      const userId = req.authContext.userId;
      const updates = req.body;

      // FIC: Verify ownership (EN)
      // FIC: Verificar propiedad (ES)
      const { data: existing, error: getError } = await supabase
        .from("confluence_view_presets")
        .select("user_id")
        .eq("id", id)
        .single();

      if (getError || existing?.user_id !== userId) {
        return res.status(403).json({
          error: "PRESET_UPDATE_DENIED",
          message: "You can only update your own presets",
        });
      }

      const { data, error } = await supabase
        .from("confluence_view_presets")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          error: "PRESET_UPDATE_FAILED",
          message: error.message,
        });
      }

      res.json({
        success: true,
        preset: data,
      });
    } catch (err) {
      res.status(500).json({
        error: "PRESET_UPDATE_ERROR",
        message: (err as Error).message,
      });
    }
  }
);

// FIC: Delete preset (owner only) (EN)
// FIC: Eliminar preset (solo propietario) (ES)
router.delete(
  "/confluence-presets/:id",
  authContextMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.authContext?.token) {
        return res.status(401).json({ error: "AUTH_CONTEXT_MISSING" });
      }
      const supabase = createAuthenticatedClient(req.authContext.token);

      const { id } = req.params;
      const userId = req.authContext.userId;

      // FIC: Verify ownership (EN)
      // FIC: Verificar propiedad (ES)
      const { data: existing, error: getError } = await supabase
        .from("confluence_view_presets")
        .select("user_id")
        .eq("id", id)
        .single();

      if (getError || existing?.user_id !== userId) {
        return res.status(403).json({
          error: "PRESET_DELETE_DENIED",
          message: "You can only delete your own presets",
        });
      }

      const { error } = await supabase
        .from("confluence_view_presets")
        .delete()
        .eq("id", id);

      if (error) {
        return res.status(400).json({
          error: "PRESET_DELETE_FAILED",
          message: error.message,
        });
      }

      res.json({
        success: true,
        message: "Preset deleted successfully",
      });
    } catch (err) {
      res.status(500).json({
        error: "PRESET_DELETE_ERROR",
        message: (err as Error).message,
      });
    }
  }
);

export default router;

// FIC: Read confluence column configs for metadata-driven renderer (EN)
// FIC: Leer configuraciones de columnas para renderer metadata-driven (ES)
router.get(
  "/confluence-columns",
  authContextMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.authContext?.token) {
        return res.status(401).json({ error: "AUTH_CONTEXT_MISSING" });
      }

      const supabase = createAuthenticatedClient(req.authContext.token);
      const { data, error } = await supabase
        .from("confluence_column_configs")
        .select("field_key,label,data_type,visible,order_index,format_rule,color_rule,is_filterable,is_sortable,is_exportable")
        .order("order_index", { ascending: true });

      if (error) {
        return res.status(400).json({
          error: "CONFLUENCE_COLUMNS_READ_FAILED",
          message: error.message
        });
      }

      return res.status(200).json({ columns: data ?? [] });
    } catch (err) {
      return res.status(500).json({
        error: "CONFLUENCE_COLUMNS_READ_ERROR",
        message: (err as Error).message
      });
    }
  }
);
