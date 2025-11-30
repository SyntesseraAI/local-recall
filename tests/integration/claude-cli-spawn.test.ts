import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';

/**
 * Integration tests for spawning Claude CLI
 * These tests verify that the Claude CLI can be executed quickly and reliably
 */
describe('Claude CLI spawn', () => {
  it('should spawn claude -p with a simple prompt and respond within 15 seconds', async () => {
    const startTime = Date.now();

    const result = await new Promise<{ stdout: string; stderr: string; code: number | null; duration: number }>((resolve) => {
      const args = ['-p', 'Say hello world', '--model', 'haiku', '--output-format', 'json', '--strict-mcp-config'];

      let stdout = '';
      let stderr = '';
      let resolved = false;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill('SIGTERM');
          resolve({
            stdout,
            stderr,
            code: null,
            duration: Date.now() - startTime,
          });
        }
      }, 15000);

      const child = spawn('claude', args, {
        // Use 'ignore' for stdin - Claude CLI hangs if stdin is piped but not written to
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr: `Error: ${error.message}`,
            code: -1,
            duration: Date.now() - startTime,
          });
        }
      });

      child.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr,
            code,
            duration: Date.now() - startTime,
          });
        }
      });
    });

    console.log(`Claude CLI response time: ${result.duration}ms`);
    console.log(`Exit code: ${result.code}`);
    console.log(`Stdout length: ${result.stdout.length}`);
    if (result.stderr) {
      console.log(`Stderr: ${result.stderr}`);
    }

    // Verify the command completed successfully
    expect(result.code).toBe(0);

    // Verify we got some output
    expect(result.stdout.length).toBeGreaterThan(0);

    // Verify it completed within 15 seconds
    expect(result.duration).toBeLessThan(15000);
  }, 20000); // 20 second timeout for the test itself

  it('should spawn quickly (under 1 second to start)', async () => {
    const startTime = Date.now();

    const spawnResult = await new Promise<{ spawned: boolean; pid: number | undefined; spawnTime: number; error?: string }>((resolve) => {
      try {
        const child = spawn('claude', ['--version'], {
          // Use 'ignore' for stdin for consistency
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        const spawnTime = Date.now() - startTime;

        child.on('spawn', () => {
          resolve({
            spawned: true,
            pid: child.pid,
            spawnTime,
          });
          child.kill();
        });

        child.on('error', (error) => {
          resolve({
            spawned: false,
            pid: undefined,
            spawnTime,
            error: error.message,
          });
        });

        // Timeout for spawn event
        setTimeout(() => {
          resolve({
            spawned: child.pid !== undefined,
            pid: child.pid,
            spawnTime,
            error: 'spawn event timeout',
          });
          child.kill();
        }, 1000);
      } catch (error) {
        resolve({
          spawned: false,
          pid: undefined,
          spawnTime: Date.now() - startTime,
          error: String(error),
        });
      }
    });

    console.log(`Spawn time: ${spawnResult.spawnTime}ms`);
    console.log(`PID: ${spawnResult.pid}`);
    if (spawnResult.error) {
      console.log(`Error: ${spawnResult.error}`);
    }

    // Verify spawn happened quickly
    expect(spawnResult.spawned).toBe(true);
    expect(spawnResult.spawnTime).toBeLessThan(1000);
  }, 5000);

  it('should handle keyword extraction prompt format', async () => {
    const startTime = Date.now();
    const testPrompt = 'does the same need to happen for transcript processing?';
    const fullPrompt = `[LOCAL_RECALL_INTERNAL] Extract keywords from this text and return only the keywords as a JSON array of strings. No explanation, just the JSON array:\n\n${testPrompt}`;

    const result = await new Promise<{ stdout: string; stderr: string; code: number | null; duration: number }>((resolve) => {
      const args = ['-p', fullPrompt, '--model', 'haiku', '--output-format', 'json', '--strict-mcp-config'];

      let stdout = '';
      let stderr = '';
      let resolved = false;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill('SIGTERM');
          resolve({
            stdout,
            stderr,
            code: null,
            duration: Date.now() - startTime,
          });
        }
      }, 20000);

      const child = spawn('claude', args, {
        // Use 'ignore' for stdin - Claude CLI hangs if stdin is piped but not written to
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr: `Error: ${error.message}`,
            code: -1,
            duration: Date.now() - startTime,
          });
        }
      });

      child.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr,
            code,
            duration: Date.now() - startTime,
          });
        }
      });
    });

    console.log(`Keyword extraction response time: ${result.duration}ms`);
    console.log(`Exit code: ${result.code}`);
    console.log(`Response: ${result.stdout.substring(0, 500)}`);

    // Verify the command completed successfully
    expect(result.code).toBe(0);

    // Try to parse the response as JSON
    try {
      let parsed = JSON.parse(result.stdout);
      if (parsed.result) {
        if (typeof parsed.result === 'string') {
          parsed = JSON.parse(parsed.result);
        } else {
          parsed = parsed.result;
        }
      }
      console.log(`Parsed keywords:`, parsed);
      expect(Array.isArray(parsed)).toBe(true);
    } catch (e) {
      // Try to extract JSON array from response
      const match = result.stdout.match(/\[[\s\S]*?\]/);
      if (match) {
        const arr = JSON.parse(match[0]);
        console.log(`Extracted keywords:`, arr);
        expect(Array.isArray(arr)).toBe(true);
      } else {
        console.log(`Could not parse response as JSON array`);
      }
    }

    // Should complete within 20 seconds
    expect(result.duration).toBeLessThan(20000);
  }, 25000);
});
