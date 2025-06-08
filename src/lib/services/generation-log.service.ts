import type { SupabaseClient } from "../../db/supabase.client";
import type { PaginationResponseDTO, GenerationLogListResponseDTO } from "../../types";

/**
 * Service for handling generation logs
 */
class GenerationLogService {
  // Private static instance for singleton pattern
  private static instance: GenerationLogService;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  /**
   * Get the singleton instance of GenerationLogService
   * @returns The single instance of GenerationLogService
   */
  public static getInstance(): GenerationLogService {
    if (!GenerationLogService.instance) {
      GenerationLogService.instance = new GenerationLogService();
    }
    return GenerationLogService.instance;
  }

  /**
   * Get generation logs for a user
   * @param supabase Supabase client
   * @param userId User ID to get logs for
   * @param page Page number (1-based)
   * @param limit Items per page
   * @returns List of generation logs with pagination
   */
  async getUserGenerationLogs(
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    limit = 10
  ): Promise<GenerationLogListResponseDTO> {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get logs count for pagination
    const { count, error: countError } = await supabase
      .from("generation_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error fetching generation logs count:", countError);
      throw new Error("Failed to fetch generation logs");
    }

    // Get logs with pagination
    const { data: logs, error: logsError } = await supabase
      .from("generation_logs")
      .select(
        `
        id,
        set_id,
        set_title,
        generated_count,
        accepted_count,
        rejected_count,
        created_at as generated_at
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (logsError) {
      console.error("Error fetching generation logs:", logsError);
      throw new Error("Failed to fetch generation logs");
    }

    // Calculate total pages
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Build response
    const pagination: PaginationResponseDTO = {
      total: totalCount,
      page,
      limit,
      total_pages: totalPages,
    };

    return {
      data: logs || [],
      pagination,
    };
  }

  /**
   * Get generation limit for a user
   * @param supabase Supabase client
   * @param userId User ID to check
   * @returns User's generation limit information
   */
  async getUserGenerationLimit(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase.rpc("check_generation_limit", {
      user_id_param: userId,
    });

    if (error) {
      console.error("Error fetching user generation limit:", error);
      throw new Error("Failed to fetch generation limit");
    }

    return {
      max_daily_limit: data.max_daily_limit || 5,
      used_count: data.used_count || 0,
      remaining_count: (data.max_daily_limit || 5) - (data.used_count || 0),
      reset_at: data.reset_at || new Date(Date.now() + 86400000).toISOString(),
    };
  }
}

// Singleton instance for use throughout the application
export const generationLogService = GenerationLogService.getInstance();
