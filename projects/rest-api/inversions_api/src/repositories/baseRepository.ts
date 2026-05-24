/**
 * FIC: Base Repository pattern for consistent data access across all modules.
 * Provides generic CRUD operations, query building, and error handling.
 * 
 * FIC: Patrón base Repository para acceso consistente a datos en todos los módulos.
 * Proporciona operaciones CRUD genéricas, construcción de consultas y manejo de errores.
 * 
 * Constraint: All repositories MUST respect Supabase RLS policies.
 * When filtering by user_id or role, ensure the RLS policy on the table
 * enforces that constraint at the database level, not in the application.
 * 
 * Restricción: Todos los repositorios DEBEN respetar las políticas RLS de Supabase.
 * Al filtrar por user_id o rol, asegúrese de que la política RLS en la tabla
 * refuerce esa restricción a nivel de base de datos, no en la aplicación.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * FIC: Generic error wrapper for repository operations.
 * Standardizes error handling across all data access layers.
 * 
 * FIC: Envoltorio de error genérico para operaciones de repositorio.
 * Estandariza el manejo de errores en todas las capas de acceso a datos.
 */
export interface RepositoryError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
  originalError?: PostgrestError;
}

/**
 * FIC: Query builder options for standard repository operations.
 * FIC: Opciones del constructor de consultas para operaciones estándar de repositorio.
 */
export interface QueryOptions {
  select?: string;
  filter?: Record<string, any>;
  order?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
}

/**
 * FIC: Base Repository class providing generic CRUD operations.
 * Subclasses override tableName and optionally customize behavior.
 * 
 * FIC: Clase base Repository que proporciona operaciones CRUD genéricas.
 * Las subclases anulan tableName y opcionalmente personalizan el comportamiento.
 * 
 * Pattern: Template Method - subclasses define tableName,
 * base class provides standard implementations for create, read, update, delete.
 * 
 * Patrón: Método de Plantilla - las subclases definen tableName,
 * la clase base proporciona implementaciones estándar para crear, leer, actualizar, eliminar.
 */
export abstract class BaseRepository<T> {
  /**
   * FIC: Subclasses must define the table name for this repository.
   * FIC: Las subclases deben definir el nombre de la tabla para este repositorio.
   */
  protected abstract tableName: string;

  /**
   * FIC: Supabase client instance. Injected via constructor.
   * FIC: Instancia de cliente Supabase. Inyectada vía constructor.
   */
  protected client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * FIC: Retrieve one record by ID.
   * Respects RLS policies defined in Supabase.
   * 
   * FIC: Recuperar un registro por ID.
   * Respeta las políticas RLS definidas en Supabase.
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw this.mapError(error);
      }
      return data as T | null;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  /**
   * FIC: Retrieve all records with optional filtering and pagination.
   * Respects RLS policies; filters are applied AFTER RLS enforcement.
   * 
   * FIC: Recuperar todos los registros con filtrado y paginación opcionales.
   * Respeta las políticas RLS; los filtros se aplican DESPUÉS de la aplicación de RLS.
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      let query = this.client.from(this.tableName).select(options?.select || "*");

      // FIC: Apply filter conditions
      if (options?.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          query = query.eq(key, value);
        }
      }

      // FIC: Apply ordering
      if (options?.order) {
        for (const { column, ascending = true } of options.order) {
          query = query.order(column, { ascending });
        }
      }

      // FIC: Apply pagination
      if (options?.offset !== undefined) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      } else if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw this.mapError(error);
      }
      return data as T[];
    } catch (err) {
      throw this.handleError(err);
    }
  }

  /**
   * FIC: Create a new record.
   * Returns the created record with its generated ID.
   * 
   * FIC: Crear un nuevo registro.
   * Devuelve el registro creado con su ID generado.
   */
  async create(record: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert([record] as any)
        .select()
        .single();

      if (error) {
        throw this.mapError(error);
      }
      return data as T;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  /**
   * FIC: Update an existing record by ID.
   * Returns the updated record.
   * 
   * FIC: Actualizar un registro existente por ID.
   * Devuelve el registro actualizado.
   */
  async update(id: string, partial: Partial<T>): Promise<T> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update(partial as any)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw this.mapError(error);
      }
      return data as T;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  /**
   * FIC: Delete a record by ID.
   * Returns void if successful.
   * 
   * FIC: Eliminar un registro por ID.
   * Devuelve void si tiene éxito.
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        throw this.mapError(error);
      }
    } catch (err) {
      throw this.handleError(err);
    }
  }

  /**
   * FIC: Count records matching optional filter criteria.
   * Respects RLS policies.
   * 
   * FIC: Contar registros que coincidan con criterios de filtro opcionales.
   * Respeta las políticas RLS.
   */
  async count(filter?: Record<string, any>): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          query = query.eq(key, value);
        }
      }

      const { count, error } = await query;

      if (error) {
        throw this.mapError(error);
      }
      return count || 0;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  /**
   * FIC: Internal helper to map PostgreSQL errors to standardized RepositoryError.
   * FIC: Helper interno para mapear errores PostgreSQL a RepositoryError estandarizado.
   */
  protected mapError(error: PostgrestError): RepositoryError {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      originalError: error,
    };
  }

  /**
   * FIC: Internal helper for centralized error handling.
   * Distinguishes between repository-level errors and unexpected exceptions.
   * 
   * FIC: Helper interno para manejo centralizado de errores.
   * Distingue entre errores de repositorio y excepciones inesperadas.
   */
  protected handleError(err: any): RepositoryError {
    if (err && typeof err === "object" && "code" in err && "message" in err) {
      return err as RepositoryError;
    }
    return {
      message:
        err instanceof Error ? err.message : "Unknown repository error. Error desconocido de repositorio.",
      code: "UNKNOWN",
    };
  }
}

export default BaseRepository;
