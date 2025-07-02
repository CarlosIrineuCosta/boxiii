#!/bin/bash

# GitHub Personal Access Token Setup Script for Claude Code
# This script helps you set up a persistent GitHub PAT

echo "GitHub Personal Access Token Setup for Claude Code"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Installing..."
    echo "Please run: sudo apt update && sudo apt install gh"
    exit 1
fi

# Check current auth status
echo "Checking current GitHub authentication status..."
gh auth status 2>&1

echo ""
echo "Choose setup method:"
echo "1) Use GitHub CLI (Recommended - most secure)"
echo "2) Add to .bashrc (persistent across all projects)"
echo "3) Add to project .env file (project-specific)"
echo "4) View setup instructions"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Starting GitHub CLI authentication..."
        echo "You will need your Personal Access Token ready."
        echo ""
        echo "To create a token:"
        echo "1. Go to https://github.com/settings/tokens"
        echo "2. Generate new token (classic)"
        echo "3. Select scopes: repo, read:org, gist"
        echo ""
        read -p "Press Enter when you have your token ready..." 
        gh auth login
        echo ""
        echo "Testing authentication..."
        gh auth status
        ;;
    
    2)
        echo ""
        read -sp "Enter your GitHub Personal Access Token: " token
        echo ""
        
        # Add to .bashrc if not already present
        if ! grep -q "GITHUB_TOKEN" ~/.bashrc; then
            echo "export GITHUB_TOKEN=\"$token\"" >> ~/.bashrc
            echo "Token added to ~/.bashrc"
            echo "Run 'source ~/.bashrc' to apply changes"
        else
            echo "GITHUB_TOKEN already exists in ~/.bashrc"
            echo "Edit ~/.bashrc manually to update"
        fi
        ;;
    
    3)
        echo ""
        read -sp "Enter your GitHub Personal Access Token: " token
        echo ""
        
        # Check if .env exists
        if [ -f ".env" ]; then
            if grep -q "GITHUB_TOKEN" .env; then
                echo "GITHUB_TOKEN already exists in .env"
                read -p "Update it? (y/n): " update
                if [ "$update" = "y" ]; then
                    sed -i '/GITHUB_TOKEN/d' .env
                    echo "GITHUB_TOKEN=$token" >> .env
                    echo "Token updated in .env"
                fi
            else
                echo "GITHUB_TOKEN=$token" >> .env
                echo "Token added to .env"
            fi
        else
            echo "GITHUB_TOKEN=$token" > .env
            echo "Created .env with token"
        fi
        
        # Ensure .env is in .gitignore
        if [ -f ".gitignore" ]; then
            if ! grep -q "^\.env$" .gitignore; then
                echo ".env" >> .gitignore
                echo "Added .env to .gitignore"
            fi
        else
            echo ".env" > .gitignore
            echo "Created .gitignore with .env"
        fi
        ;;
    
    4)
        echo ""
        echo "Opening setup instructions..."
        if [ -f "GITHUB_PAT_SETUP.md" ]; then
            less GITHUB_PAT_SETUP.md
        else
            echo "GITHUB_PAT_SETUP.md not found in current directory"
        fi
        ;;
    
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Setup complete!"
echo ""
echo "To verify your setup:"
echo "  gh auth status         # Check GitHub CLI auth"
echo "  echo \$GITHUB_TOKEN    # Check environment variable"
echo "  gh repo list --limit 5 # Test API access"