# Changelogen 💅 JIRA Plugin

A JIRA integration plugin for [changelogen](https://github.com/unjs/changelogen) that automatically detects and links JIRA tickets in commit messages.

## Features

- 🎯 **Automatic Detection**: Finds JIRA ticket references in commit messages and bodies
- 🔗 **Smart Linking**: Generates clickable links to JIRA tickets in changelogs
- ⚙️ **Configurable**: Customize project keys, base URL, and ticket patterns
- 🚀 **Zero Dependencies**: Lightweight plugin with no runtime dependencies
- 📝 **TypeScript**: Full TypeScript support with type definitions

## Installation

```bash
npm install changelogen-jira-plugin
# or
pnpm add changelogen-jira-plugin
# or
yarn add changelogen-jira-plugin
```

## Usage

Add the plugin to your `changelog.config.js`:

```javascript
export default {
  plugins: {
    "changelogen-jira-plugin": {
      baseUrl: "https://your-company.atlassian.net",
      projectKeys: ["PROJ", "TASK", "BUG"],
    },
  },
};
```

## Configuration

### Required Options

- **`baseUrl`** (string): Your JIRA instance base URL
- **`projectKeys`** (string[]): Array of JIRA project keys to match

### Optional Options

- **`ticketPattern`** (RegExp): Custom regex pattern for ticket matching
  - Default: `/([A-Z]+-\d+)/g`

### Example Configuration

```javascript
export default {
  plugins: {
    "changelogen-jira-plugin": {
      baseUrl: "https://company.atlassian.net",
      projectKeys: ["FRONTEND", "BACKEND", "INFRA"],
      ticketPattern: /([A-Z]{2,}-\d{3,})/g, // Custom pattern
    },
  },
};
```

## How It Works

The plugin scans commit messages and bodies for JIRA ticket references that match:

1. The configured `ticketPattern` (default: uppercase letters, dash, numbers)
2. One of the specified `projectKeys`

### Example Commit Processing

**Input commit:**
```
feat: add user authentication FRONTEND-123

Implements OAuth2 flow for user login.
Also fixes BACKEND-456 API endpoint.
```

**Output in changelog:**
- Adds clickable links: `FRONTEND-123` → `https://company.atlassian.net/browse/FRONTEND-123`
- Adds clickable links: `BACKEND-456` → `https://company.atlassian.net/browse/BACKEND-456`

## TypeScript Support

The plugin is written in TypeScript and provides full type definitions:

```typescript
import type { JiraPluginConfig } from "changelogen-jira-plugin";

const config: JiraPluginConfig = {
  baseUrl: "https://company.atlassian.net",
  projectKeys: ["PROJ"],
  ticketPattern: /([A-Z]+-\d+)/g,
};
```

## Development

### Setup

```bash
git clone <repository-url>
cd changelogen-jira-plugin
pnpm install
```

### Scripts

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Testing

The plugin includes comprehensive tests covering:

- Ticket detection in commit messages and bodies
- Multiple tickets per commit
- Project key filtering
- Custom ticket patterns
- Preservation of existing references

Run tests with:

```bash
pnpm test
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `pnpm test`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related

- [changelogen](https://github.com/unjs/changelogen) - The main changelog generator
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message specification