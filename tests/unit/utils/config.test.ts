import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig, getConfig, validateConfig } from '../../../src/utils/config.js';

describe('config utilities', () => {
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-config-test-'));
    originalEnv = { ...process.env };
    // Clear relevant env vars
    delete process.env['LOCAL_RECALL_DIR'];
    delete process.env['LOCAL_RECALL_MAX_MEMORIES'];
    delete process.env['LOCAL_RECALL_INDEX_REFRESH'];
    delete process.env['LOCAL_RECALL_FUZZY_THRESHOLD'];
    delete process.env['LOCAL_RECALL_MAX_CONTEXT'];
    delete process.env['MCP_PORT'];
    delete process.env['MCP_HOST'];
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load default config when no file exists', async () => {
      const config = await loadConfig(path.join(testDir, 'nonexistent.json'));

      expect(config.memoryDir).toBeDefined();
      expect(config.maxMemories).toBe(1000);
      expect(config.indexRefreshInterval).toBe(300);
      expect(config.fuzzyThreshold).toBe(0.6);
    });

    it('should load config from file', async () => {
      const configPath = path.join(testDir, 'config.json');
      await fs.writeFile(
        configPath,
        JSON.stringify({
          memoryDir: '/custom/dir',
          maxMemories: 500,
        })
      );

      const config = await loadConfig(configPath);

      expect(config.memoryDir).toBe('/custom/dir');
      expect(config.maxMemories).toBe(500);
    });

    it('should override with environment variables', async () => {
      process.env['LOCAL_RECALL_DIR'] = '/env/dir';
      process.env['LOCAL_RECALL_MAX_MEMORIES'] = '250';
      process.env['LOCAL_RECALL_FUZZY_THRESHOLD'] = '0.8';

      const config = await loadConfig(path.join(testDir, 'nonexistent.json'));

      expect(config.memoryDir).toBe('/env/dir');
      expect(config.maxMemories).toBe(250);
      expect(config.fuzzyThreshold).toBe(0.8);
    });

    it('should merge file and env config (env takes precedence)', async () => {
      const configPath = path.join(testDir, 'config.json');
      await fs.writeFile(
        configPath,
        JSON.stringify({
          memoryDir: '/file/dir',
          maxMemories: 500,
        })
      );

      process.env['LOCAL_RECALL_DIR'] = '/env/dir';

      const config = await loadConfig(configPath);

      expect(config.memoryDir).toBe('/env/dir'); // env wins
      expect(config.maxMemories).toBe(500); // from file
    });

    it('should load hook configuration from env', async () => {
      process.env['LOCAL_RECALL_MAX_CONTEXT'] = '20';

      const config = await loadConfig(path.join(testDir, 'nonexistent.json'));

      expect(config.hooks.maxContextMemories).toBe(20);
    });

    it('should load MCP configuration from env', async () => {
      process.env['MCP_PORT'] = '3001';
      process.env['MCP_HOST'] = 'localhost';

      const config = await loadConfig(path.join(testDir, 'nonexistent.json'));

      expect(config.mcp.port).toBe(3001);
      expect(config.mcp.host).toBe('localhost');
    });

    it('should handle malformed config file', async () => {
      const configPath = path.join(testDir, 'bad-config.json');
      await fs.writeFile(configPath, 'not valid json');

      // Should not throw, just use defaults
      const config = await loadConfig(configPath);

      expect(config.maxMemories).toBe(1000); // default
    });
  });

  describe('getConfig', () => {
    it('should return defaults when config not loaded', () => {
      const config = getConfig();

      expect(config.maxMemories).toBe(1000);
      expect(config.fuzzyThreshold).toBe(0.6);
    });

    it('should return cached config after loadConfig', async () => {
      process.env['LOCAL_RECALL_MAX_MEMORIES'] = '750';

      await loadConfig(path.join(testDir, 'nonexistent.json'));

      const config = getConfig();

      expect(config.maxMemories).toBe(750);
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const result = validateConfig({
        memoryDir: './local-recall',
        maxMemories: 500,
        indexRefreshInterval: 300,
        fuzzyThreshold: 0.7,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid maxMemories', () => {
      const result = validateConfig({
        maxMemories: -1,
      });

      expect(result.valid).toBe(false);
      expect(result.errors?.some((e) => e.includes('maxMemories'))).toBe(true);
    });

    it('should reject invalid fuzzyThreshold (out of range)', () => {
      const result = validateConfig({
        fuzzyThreshold: 1.5,
      });

      expect(result.valid).toBe(false);
      expect(result.errors?.some((e) => e.includes('fuzzyThreshold'))).toBe(true);
    });

    it('should reject invalid fuzzyThreshold (below 0)', () => {
      const result = validateConfig({
        fuzzyThreshold: -0.1,
      });

      expect(result.valid).toBe(false);
    });

    it('should accept empty object (uses defaults)', () => {
      const result = validateConfig({});

      expect(result.valid).toBe(true);
    });

    it('should validate nested hooks config', () => {
      const result = validateConfig({
        hooks: {
          maxContextMemories: 15,
        },
      });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid hooks config', () => {
      const result = validateConfig({
        hooks: {
          maxContextMemories: -10,
        },
      });

      expect(result.valid).toBe(false);
    });

    it('should validate nested mcp config', () => {
      const result = validateConfig({
        mcp: {
          port: 3000,
          host: 'localhost',
        },
      });

      expect(result.valid).toBe(true);
    });
  });
});
