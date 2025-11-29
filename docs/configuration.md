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
  "hooks": {
    "timeWindow": 30,
    "maxContextMemories": 10
  },
  "mcp": {
    "port": 3000,
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
| `LOCAL_RECALL_TIME_WINDOW` | `hooks.timeWindow` | `30` | Stop hook time window (seconds) |
| `LOCAL_RECALL_MAX_CONTEXT` | `hooks.maxContextMemories` | `10` | Max memories at session start |
| `MCP_PORT` | `mcp.port` | `3000` | MCP server port |
| `MCP_HOST` | `mcp.host` | `localhost` | MCP server host |
| `LOCAL_RECALL_DEBUG` | - | `false` | Enable debug logging |

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

### hooks.timeWindow

**Type**: `number` (seconds)
**Default**: `30`

How far back the stop hook looks when identifying new messages in the transcript.

### hooks.maxContextMemories

**Type**: `number`
**Default**: `10`

Maximum number of memories to load into context at session start. Higher values provide more context but increase token usage.

### mcp.port / mcp.host

**Type**: `number` / `string`
**Default**: `3000` / `localhost`

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
    "level": "info",
    "file": "./local-recall/logs/local-recall.log",
    "maxSize": "10m",
    "maxFiles": 5
  }
}
```

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
  hooks: {
    timeWindow: 60
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
  "hooks": {
    "timeWindow": 60,
    "maxContextMemories": 20
  },
  "logging": {
    "level": "debug"
  }
}
```

### Production

```json
{
  "memoryDir": "/var/data/local-recall",
  "maxMemories": 5000,
  "indexRefreshInterval": 600,
  "fuzzyThreshold": 0.7,
  "archivePolicy": {
    "enabled": true,
    "strategy": "least-accessed"
  },
  "logging": {
    "level": "warn",
    "file": "/var/log/local-recall.log"
  }
}
```
