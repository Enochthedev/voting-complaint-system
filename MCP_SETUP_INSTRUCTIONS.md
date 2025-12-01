# MCP Server Setup Instructions

## GitHub MCP Server

To enable GitHub integration, you need to add your GitHub Personal Access Token:

### Steps:

1. **Create a GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "Kiro MCP Access"
   - Select scopes:
     - `repo` (Full control of private repositories)
     - `read:org` (Read org and team membership)
     - `read:user` (Read user profile data)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)

2. **Add the token to your MCP config:**
   - Open: `~/.kiro/settings/mcp.json`
   - Find the `github` section
   - Replace the empty `GITHUB_PERSONAL_ACCESS_TOKEN` value with your token:
     ```json
     "env": {
       "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
     }
     ```

3. **Restart Kiro** or reconnect the MCP server from the MCP Server view

### What you can do with GitHub MCP:

- View commit history
- Read file contents from repositories
- Search repositories
- View and manage issues
- Check pull requests
- Get repository information

## Vercel MCP Server

Unfortunately, there isn't an official Vercel MCP server yet. However, you can:

### Alternative: Use Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# View logs
vercel logs [deployment-url]

# View deployments
vercel ls

# Get deployment info
vercel inspect [deployment-url]
```

### Check Vercel Logs for Current Error:

```bash
vercel logs voting-complaint-system.vercel.app --follow
```

This will show you the real-time server logs to debug the current error.

## Current MCP Servers Configured:

1. ✅ **Fetch** - HTTP requests and web scraping
2. ✅ **Supabase** - Database operations and management
3. ✅ **Postgres** - Direct database queries
4. 🔧 **GitHub** - Needs token configuration (see above)

## Testing MCP Connections:

After configuring, you can test by asking me to:

- "List recent commits on this repository"
- "Show me the issues in this repo"
- "Get the contents of package.json from GitHub"
