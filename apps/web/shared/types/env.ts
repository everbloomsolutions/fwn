/**
 * Environment variable types
 * These should match the variables defined in root .env
 */

export interface Env {
  // Public API URL (exposed to client)
  NEXT_PUBLIC_API_URL: string;

  // Port configuration
  FRONTEND_PORT?: string;
}

/**
 * Get environment variable with type safety
 */
export function getEnv(): Env {
  return {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    FRONTEND_PORT:
      process.env.FRONTEND_PORT ||
      process.env.PORT ||
      '5000',
  };
}

