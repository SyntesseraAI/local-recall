import { promises as fs } from 'node:fs';
import path from 'node:path';
import { type Config, configSchema } from '../core/types.js';

/**
 * Cached configuration singleton.
 * Intentionally allows overwriting: calling loadConfig() multiple times
 * will reload the configuration (e.g., after config file changes).
 * For cached access without reloading, use getConfig().
 */
let cachedConfig: Config | null = null;

/**
 * Load configuration from file and environment.
 * This function always reloads the configuration from disk and environment,
 * updating the cached value. Use getConfig() for cached access.
 *
 * @param configPath - Optional path to config file. Defaults to .local-recall.json in cwd.
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  const defaultPath = path.join(process.cwd(), '.local-recall.json');
  const filePath = configPath ?? defaultPath;

  let fileConfig = {};

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    fileConfig = JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Warning: Could not parse config file: ${filePath}`);
    }
    // File doesn't exist, use defaults
  }

  // Override with environment variables
  const envConfig: Partial<Config> = {};

  if (process.env['LOCAL_RECALL_DIR']) {
    envConfig.memoryDir = process.env['LOCAL_RECALL_DIR'];
  }
  if (process.env['LOCAL_RECALL_MAX_MEMORIES']) {
    envConfig.maxMemories = parseInt(process.env['LOCAL_RECALL_MAX_MEMORIES'], 10);
  }
  if (process.env['LOCAL_RECALL_INDEX_REFRESH']) {
    envConfig.indexRefreshInterval = parseInt(
      process.env['LOCAL_RECALL_INDEX_REFRESH'],
      10
    );
  }
  if (process.env['LOCAL_RECALL_FUZZY_THRESHOLD']) {
    envConfig.fuzzyThreshold = parseFloat(
      process.env['LOCAL_RECALL_FUZZY_THRESHOLD']
    );
  }

  // Merge configs: env > file > defaults
  const merged = {
    ...fileConfig,
    ...envConfig,
    hooks: {
      ...(fileConfig as Partial<Config>).hooks,
      ...(process.env['LOCAL_RECALL_TIME_WINDOW'] && {
        timeWindow: parseInt(process.env['LOCAL_RECALL_TIME_WINDOW'], 10),
      }),
      ...(process.env['LOCAL_RECALL_MAX_CONTEXT'] && {
        maxContextMemories: parseInt(process.env['LOCAL_RECALL_MAX_CONTEXT'], 10),
      }),
    },
    mcp: {
      ...(fileConfig as Partial<Config>).mcp,
      ...(process.env['MCP_PORT'] && {
        port: parseInt(process.env['MCP_PORT'], 10),
      }),
      ...(process.env['MCP_HOST'] && {
        host: process.env['MCP_HOST'],
      }),
    },
  };

  cachedConfig = configSchema.parse(merged);
  return cachedConfig;
}

/**
 * Get the current configuration (synchronous, uses cached value)
 */
export function getConfig(): Config {
  if (!cachedConfig) {
    // Return defaults if config hasn't been loaded yet
    cachedConfig = configSchema.parse({});
  }
  return cachedConfig;
}

/**
 * Validate configuration without loading it
 */
export function validateConfig(config: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const result = configSchema.safeParse(config);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    ),
  };
}
