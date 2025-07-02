# GitHub Personal Access Token Setup for Claude Code

This guide will help you set up a GitHub Personal Access Token (PAT) that persists across Claude Code sessions.

## Step 1: Create a GitHub Personal Access Token

### Option A: Personal Access Token (Classic) - Recommended for simplicity

1. Go to GitHub.com and log in
2. Click your profile picture → Settings
3. Scroll down to "Developer settings" (bottom of left sidebar)
4. Click "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token" → "Generate new token (classic)"
6. Give your token a descriptive name: `Claude Code CLI`
7. Set expiration (90 days recommended, or custom)
8. Select the following scopes:
   - **repo** (Full control of private repositories)
   - **read:org** (Read org and team membership, read org projects)
   - **gist** (Create gists)
   - **workflow** (Update GitHub Action workflows) - optional
9. Click "Generate token"
10. **IMPORTANT**: Copy the token immediately (it won't be shown again!)

### Option B: Fine-grained Personal Access Token - More secure but limited

1. Follow steps 1-4 above
2. Click "Personal access tokens" → "Fine-grained tokens"
3. Click "Generate new token"
4. Set token name: `Claude Code CLI`
5. Set expiration
6. Select repository access (specific repos or all)
7. Set permissions as needed
8. Generate and copy token

## Step 2: Store the Token Securely

### Method 1: Using GitHub CLI (Recommended)

```bash
# Run this command in your WSL terminal
gh auth login
```

When prompted:
- Choose: GitHub.com
- Choose: HTTPS
- Choose: Paste an authentication token
- Paste your token

This stores the token securely in `~/.config/gh/hosts.yml`

### Method 2: Environment Variable in .bashrc

```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export GITHUB_TOKEN="ghp_YOUR_TOKEN_HERE"' >> ~/.bashrc
source ~/.bashrc
```

### Method 3: Project-specific .env file

```bash
# In your project directory
echo "GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE" >> .env
```

**Important**: Make sure `.env` is in your `.gitignore`:
```bash
echo ".env" >> .gitignore
```

## Step 3: Verify Token Setup

```bash
# Check GitHub CLI authentication
gh auth status

# Test with a simple command
gh repo list --limit 5
```

## Step 4: Configure Git to Use Token

```bash
# Configure git to use the token for HTTPS operations
gh auth setup-git
```

## Security Best Practices

1. **Never commit tokens to version control**
2. **Use environment variables or GitHub CLI storage**
3. **Set reasonable expiration dates**
4. **Use minimal required permissions**
5. **Rotate tokens regularly**

## Troubleshooting

### Token not persisting?
- Check if `~/.config/gh/hosts.yml` exists
- Verify environment variables are sourced
- Ensure proper file permissions

### Permission denied errors?
- Verify token has required scopes
- Check token hasn't expired
- Ensure you're using the correct token

### Multiple GitHub accounts?
- Use different tokens for different accounts
- Configure git with specific credentials per repository

## Token Scopes Reference

| Scope | Purpose | Required for |
|-------|---------|--------------|
| repo | Full repository access | Push, pull, create repos |
| read:org | Read organization data | View org repos |
| gist | Create and manage gists | Share code snippets |
| workflow | Modify GitHub Actions | Update CI/CD |
| write:packages | Upload packages | Package registry |
| delete:packages | Delete packages | Package cleanup |

## Persistence Across Claude Code Sessions

The token will persist if stored using:
1. **GitHub CLI** (`gh auth login`) - Stored in `~/.config/gh/`
2. **Shell profile** (`.bashrc`/`.zshrc`) - Loaded on terminal start
3. **System environment** - Available to all processes

The `.env` file method is project-specific and won't persist globally.