#!/bin/bash

# 1Password Development Environment Script
# Usage: ./scripts/dev-env.sh [command]
# Example: ./scripts/dev-env.sh npm run dev

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Loading development environment from 1Password...${NC}"

# Check if 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo -e "${RED}❌ 1Password CLI is not installed${NC}"
    echo -e "${YELLOW}Please install it with: brew install 1password-cli${NC}"
    exit 1
fi

# Check if OP_SERVICE_ACCOUNT_TOKEN is set
if [ -z "$OP_SERVICE_ACCOUNT_TOKEN" ]; then
    echo -e "${RED}❌ OP_SERVICE_ACCOUNT_TOKEN environment variable is not set${NC}"
    echo -e "${YELLOW}Please set it with your 1Password Service Account token:${NC}"
    echo -e "${YELLOW}export OP_SERVICE_ACCOUNT_TOKEN='ops_xxx_your_token_xxx'${NC}"
    exit 1
fi

# Check if 1Password is accessible
if ! op whoami &> /dev/null; then
    echo -e "${RED}❌ Cannot authenticate with 1Password${NC}"
    echo -e "${YELLOW}Please check your OP_SERVICE_ACCOUNT_TOKEN${NC}"
    exit 1
fi

# Load environment and run command
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}No command provided. Available environments:${NC}"
    echo "  - 2048Game-Development"
    echo "  - 2048Game-Production"
    echo ""
    echo -e "${YELLOW}Usage examples:${NC}"
    echo "  ./scripts/dev-env.sh npm run dev"
    echo "  ./scripts/dev-env.sh npm run build"
    echo "  ./scripts/dev-env.sh npm run test"
    exit 0
fi

echo -e "${GREEN}🚀 Running: $*${NC}"
op run --env "2048Game-Development" -- "$@"