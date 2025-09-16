# 1Password Integration Setup Guide

This guide helps you set up 1Password secrets management for the 2048 Game project.

## Prerequisites

1. **1Password Business Plan** ($8/month) - Required for Service Accounts
2. **1Password CLI installed**:
   ```bash
   brew install 1password-cli
   ```

## Setup Steps

### 1. Create Service Account

1. Go to 1Password → Integrations → Service Accounts
2. Click "Create Service Account"
3. Name: "2048Game-GitHub-Actions"
4. Grant access to necessary vaults with Read permissions
5. Save the token: `ops_xxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Create Environments

1. Go to 1Password → Developer → View Environments
2. Create two environments:

   **Development Environment: "2048Game-Development"**
   ```
   CLOUDFLARE_API_TOKEN: [dev_token_here]
   CLOUDFLARE_ACCOUNT_ID: [account_id_here]
   ```

   **Production Environment: "2048Game-Production"**
   ```
   CLOUDFLARE_API_TOKEN: [prod_token_here]
   CLOUDFLARE_ACCOUNT_ID: [account_id_here]
   ```

### 3. Configure GitHub Repository

1. Go to Repository Settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `OP_SERVICE_ACCOUNT_TOKEN`
   - Secret: Your service account token from step 1

### 4. Local Development Setup

Add this to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
export OP_SERVICE_ACCOUNT_TOKEN="ops_xxx_your_token_xxx"
```

## Usage

### Local Development

```bash
# Run development server with 1Password secrets
./scripts/dev-env.sh npm run dev

# Run tests with development environment
./scripts/dev-env.sh npm run test

# Build with development environment
./scripts/dev-env.sh npm run build
```

### Production Deployment

```bash
# Deploy to production (with confirmation prompt)
./scripts/prod-env.sh npx wrangler deploy -e production
```

### Direct 1Password CLI Usage

```bash
# List available environments
op environment list

# Get specific environment variables
op environment get "2048Game-Development"

# Run any command with development environment
op run --env "2048Game-Development" -- [your-command]
```

## Testing the Integration

1. Push to the `feature/1password-secrets` branch
2. Check GitHub Actions for the "Test 1Password Integration" workflow
3. Verify that secrets are loaded correctly in the workflow logs

## Troubleshooting

### Authentication Issues

```bash
# Check if 1Password CLI is working
op whoami

# Test environment access
op run --env "2048Game-Development" -- echo "Connection successful"
```

### GitHub Actions Failures

1. Verify `OP_SERVICE_ACCOUNT_TOKEN` is set in repository secrets
2. Check that Service Account has access to the correct environments
3. Ensure environment names match exactly in workflow files

## Security Best Practices

1. **Rotate Service Account tokens** every 30 days
2. **Use separate Service Accounts** for different projects
3. **Limit vault access** to only required environments
4. **Monitor access logs** in 1Password regularly

## Migration from GitHub Secrets

After verifying the 1Password integration works:

1. Test workflows thoroughly
2. Delete old GitHub secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Keep only `OP_SERVICE_ACCOUNT_TOKEN`

## Emergency Rollback

If you need to quickly revert to GitHub secrets:

1. Add back the original secrets to GitHub
2. Temporarily update workflows to use `${{ secrets.CLOUDFLARE_API_TOKEN }}`
3. Debug the 1Password integration

---

For more details, see the full implementation roadmap in `gha-secrets-1pass.md`.