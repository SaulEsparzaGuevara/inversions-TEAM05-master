/**
 * FIC: Supabase client singleton for REST API backend operations.
 * Provides shared database and authentication connections across all modules/services.
 * 
 * FIC: Cliente Supabase singleton para operaciones REST API backend.
 * Proporciona conexiones compartidas de base de datos y autenticacion a todos los modulos/servicios.
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// FIC: Validate required environment variables at module load time
// FIC: Validar variables de entorno requeridas en tiempo de carga del módulo
if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL environment variable is required (VITE_SUPABASE_URL is accepted as alias). " +
    "SUPABASE_URL es una variable de entorno requerida (VITE_SUPABASE_URL se acepta como alias)."
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "SUPABASE_SERVICE_KEY environment variable is required for server-side operations (SUPABASE_SERVICE_ROLE_KEY is accepted as alias). " +
    "SUPABASE_SERVICE_KEY es una variable de entorno requerida para operaciones del lado del servidor (SUPABASE_SERVICE_ROLE_KEY se acepta como alias)."
  );
}

/**
 * FIC: Shared Supabase client instance initialized with service role credentials.
 * Service role has elevated permissions and should ONLY be used for backend operations.
 * Never expose SUPABASE_SERVICE_KEY to the frontend.
 * 
 * FIC: Instancia de cliente Supabase compartida inicializada con credenciales de rol de servicio.
 * El rol de servicio tiene permisos elevados y SOLO debe usarse para operaciones backend.
 * Nunca exponer SUPABASE_SERVICE_KEY al frontend.
 * 
 * Constraint: Supabase RLS (Row-Level Security) rules must be enforced via JWT claims
 * at the database level. This client uses service role for administrative operations
 * and must respect RLS policies when inserting/updating audit records and user data.
 * 
 * Restricción: Las reglas RLS (Row-Level Security) de Supabase deben aplicarse mediante JWT claims
 * a nivel de base de datos. Este cliente utiliza rol de servicio para operaciones administrativas
 * y debe respetar políticas RLS al insertar/actualizar registros de auditoría y datos de usuario.
 */
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      // FIC: Disable auto-refresh for service role operations
      // FIC: Deshabilitar actualización automática para operaciones de rol de servicio
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      // FIC: Use ws transport for Node.js < 22
      // FIC: Usar transporte ws para Node.js < 22
      transport: ws as any,
    },
  }
);

/**
 * FIC: Helper function to initialize a client with JWT token for request-scoped operations.
 * Used to enforce RLS policies with a specific user's claims.
 * 
 * FIC: Función auxiliar para inicializar un cliente con JWT token para operaciones con ámbito de solicitud.
 * Se utiliza para aplicar políticas RLS con los claims de un usuario específico.
 */
export function createAuthenticatedClient(token: string) {
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * FIC: Health check for Supabase connection.
 * Returns true if connection is alive, false otherwise.
 * 
 * FIC: Verificación de salud para la conexión Supabase.
 * Devuelve true si la conexión está activa, false en caso contrario.
 */
export async function supabaseHealthCheck(): Promise<boolean> {
  try {
    const { error } = await supabaseClient.from("pg_stat_statements").select("*").limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabaseClient;
