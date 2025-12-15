# Configuration

## Overview

Local Recall can be configured through multiple methods:
1. Environment variables
2. Configuration file (`.local-recall.json`)
3. Programmatic options

Configuration is merged in order of precedence: programmatic > environment > file > defaults.

## Configuration File

Create `.local-recall.json` in your project root:

```json
{
  "memoryDir": "./local-recall",
  "maxMemories": 1000,
  "indexRefreshInterval": 300,
  "fuzzyThreshold": 0.6,
  "episodicEnabled": true,
  "episodicMaxTokens": 1000,
  "episodicMinSimilarity": 0.5,
  "thinkingEnabled": true,
  "thinkingMaxTokens": 1000,
  "thinkingMinSimilarity": 0.5,
  "hooks": {
    "maxContextMemories": 10
  },
  "mcp": {
    "port": 7847,
    "host": "localhost"
  }
}
```

## Environment Variables

All settings can be overridden via environment variables:

| Variable | Config Key | Default | Description |
|----------|------------|---------|-------------|
| `LOCAL_RECALL_DIR` | `memoryDir` | `./local-recall` | Memory storage directory |
| `LOCAL_RECALL_MAX_MEMORIES` | `maxMemories` | `1000` | Maximum number of memories |
| `LOCAL_RECALL_INDEX_REFRESH` | `indexRefreshInterval` | `300` | Index refresh interval (seconds) |
| `LOCAL_RECALL_FUZZY_THRESHOLD` | `fuzzyThreshold` | `0.6` | Fuzzy match threshold (0-1) |
| `LOCAL_RECALL_EPISODIC_ENABLED` | `episodicEnabled` | `true` | Enable episodic memory retrieval |
| `LOCAL_RECALL_EPISODIC_MAX_TOKENS` | `episodicMaxTokens` | `1000` | Max tokens for episodic memories |
| `LOCAL_RECALL_EPISODIC_MIN_SIMILARITY` | `episodicMinSimilarity` | `0.5` | Min similarity threshold for episodic |
| `LOCAL_RECALL_THINKING_ENABLED` | `thinkingEnabled` | `true` | Enable thinking memory retrieval |
| `LOCAL_RECALL_THINKING_MAX_TOKENS` | `thinkingMaxTokens` | `1000` | Max tokens for thinking memories |
| `LOCAL_RECALL_THINKING_MIN_SIMILARITY` | `thinkingMinSimilarity` | `0.5` | Min similarity threshold for thinking |
| `LOCAL_RECALL_MAX_CONTEXT` | `hooks.maxContextMemories` | `10` | Max memories at session start |
| `LOCAL_RECALL_LOG_LEVEL` | - | `error` | Log level: debug, info, warn, error |
| `MCP_PORT` | `mcp.port` | `7847` | MCP server port |
| `MCP_HOST` | `mcp.host` | `localhost` | MCP server host |
| `OLLAMA_BASE_URL` | - | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_EMBED_MODEL` | - | `nomic-embed-text` | Embedding model name |

## Configuration Options

### memoryDir

**Type**: `string`
**Default**: `./local-recall`

Directory where memories and index are stored. Can be absolute or relative to project root.

```json
{
  "memoryDir": "/home/user/.local-recall/project-name"
}
```

### maxMemories

**Type**: `number`
**Default**: `1000`

Maximum number of memory files allowed. When exceeded, oldest memories are archived or deleted based on `archivePolicy`.

### indexRefreshInterval

**Type**: `number` (seconds)
**Default**: `300`

How often the in-memory index is refreshed from disk. Set to `0` to disable automatic refresh.

### fuzzyThreshold

**Type**: `number` (0-1)
**Default**: `0.6`

Minimum score for fuzzy search matches:
- `1.0` = Exact matches only
- `0.8` = Very close matches
- `0.6` = Moderate fuzzy matching (default)
- `0.4` = Loose matching
- `0.0` = Match everything

### episodicEnabled

**Type**: `boolean`
**Default**: `true`

Enable or disable episodic memory retrieval in the UserPromptSubmit hook. When disabled, episodic memories won't be searched or injected into context.

### episodicMaxTokens

**Type**: `number`
**Default**: `1000`

Maximum number of tokens of episodic memories to inject into context per prompt. Memories are added in order of similarity until this budget is reached.

### episodicMinSimilarity

**Type**: `number` (0-1)
**Default**: `0.5`

Minimum similarity threshold for episodic memories. Memories with similarity below this threshold are excluded from results.

### thinkingEnabled

**Type**: `boolean`
**Default**: `true`

Enable or disable thinking memory retrieval in the UserPromptSubmit hook. When disabled, thinking memories won't be searched or injected into context.

### thinkingMaxTokens

**Type**: `number`
**Default**: `1000`

Maximum number of tokens of thinking memories to inject into context per prompt. Memories are added in order of similarity until this budget is reached.

### thinkingMinSimilarity

**Type**: `number` (0-1)
**Default**: `0.5`

Minimum similarity threshold for thinking memories. Memories with similarity below this threshold are excluded from results.

### hooks.maxContextMemories

**Type**: `number`
**Default**: `10`

Maximum number of memories to load into context at session start. Higher values provide more context but increase token usage.

### mcp.port / mcp.host

**Type**: `number` / `string`
**Default**: `7847` / `localhost`

MCP server network configuration.

## Advanced Configuration

### archivePolicy

```json
{
  "archivePolicy": {
    "enabled": true,
    "threshold": 1000,
    "archiveDir": "./local-recall/archive",
    "strategy": "oldest"
  }
}
```

| Option | Description |
|--------|-------------|
| `enabled` | Enable archiving when maxMemories reached |
| `threshold` | Number of memories that triggers archiving |
| `archiveDir` | Where to move archived memories |
| `strategy` | `oldest`, `least-accessed`, `lowest-score` |

### searchOptions

```json
{
  "searchOptions": {
    "algorithm": "levenshtein",
    "maxResults": 20,
    "boostRecent": true,
    "boostExactMatch": 2.0
  }
}
```

| Option | Description |
|--------|-------------|
| `algorithm` | Fuzzy algorithm: `levenshtein`, `jaro-winkler`, `ngram` |
| `maxResults` | Maximum search results |
| `boostRecent` | Boost recently updated memories |
| `boostExactMatch` | Multiplier for exact keyword matches |

### logging

```json
{
  "logging": {
    "level": "error",
    "file": "./local-recall/recall.log"
  }
}
```

Log levels: `debug`, `info`, `warn`, `error` (default: `error`)

Logs are written to `local-recall/recall.log`. Set `LOCAL_RECALL_LOG_LEVEL=debug` to enable verbose logging for troubleshooting.

## Per-Directory Configuration

You can create `.local-recall.json` in subdirectories to override settings for specific areas:

```
project/
├── .local-recall.json          # Project-wide config
├── src/
│   └── api/
│       └── .local-recall.json  # API-specific overrides
└── local-recall/
```

Subdirectory configs only override specified values; unspecified values inherit from parent.

## Programmatic Configuration

When using Local Recall as a library:

```typescript
import { LocalRecall } from 'local-recall';

const recall = new LocalRecall({
  memoryDir: './custom-memories',
  fuzzyThreshold: 0.7,
  episodicEnabled: true,
  episodicMaxTokens: 2000,
  thinkingEnabled: true,
  thinkingMaxTokens: 1000,
  hooks: {
    maxContextMemories: 15
  }
});
```

## Validation

Configuration is validated on load. Invalid values will:
1. Log a warning
2. Fall back to defaults

To validate configuration without running:

```bash
npx local-recall config:validate
```

## Example Configurations

### Minimal (all defaults)

```json
{}
```

### Development

```json
{
  "memoryDir": "./local-recall",
  "fuzzyThreshold": 0.5,
  "episodicEnabled": true,
  "episodicMinSimilarity": 0.4,
  "thinkingEnabled": true,
  "thinkingMinSimilarity": 0.4,
  "hooks": {
    "maxContextMemories": 20
  }
}
```

To enable debug logging, set the environment variable:
```bash
export LOCAL_RECALL_LOG_LEVEL=debug
```

### Production

```json
{
  "memoryDir": "/var/data/local-recall",
  "maxMemories": 5000,
  "indexRefreshInterval": 600,
  "fuzzyThreshold": 0.7,
  "episodicEnabled": true,
  "episodicMaxTokens": 1500,
  "episodicMinSimilarity": 0.6,
  "thinkingEnabled": true,
  "thinkingMaxTokens": 1000,
  "thinkingMinSimilarity": 0.6,
  "archivePolicy": {
    "enabled": true,
    "strategy": "least-accessed"
  }
}
```

### Episodic Only (Disable Thinking)

```json
{
  "episodicEnabled": true,
  "thinkingEnabled": false
}
```

### Thinking Only (Disable Episodic)

```json
{
  "episodicEnabled": false,
  "thinkingEnabled": true
}
```
