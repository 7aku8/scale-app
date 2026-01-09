#!/bin/bash
# This script helps you set up SSH keys for the deployment user
# Run this on your LOCAL machine, not on the VPS

set -e

echo "========================================="
echo "SSH Key Setup for Deployment User"
echo "========================================="
echo ""

# Prompt for VPS details
read -p "Enter your VPS IP address: " VPS_IP
read -p "Enter your current SSH user (not deployer): " CURRENT_USER
read -p "Enter deployment user name [deployer]: " DEPLOY_USER
DEPLOY_USER=${DEPLOY_USER:-deployer}

# SSH key path
SSH_KEY_PATH="$HOME/.ssh/scale-app-deploy"

echo ""
echo "Step 1: Generating SSH key pair..."
if [ -f "$SSH_KEY_PATH" ]; then
    read -p "SSH key already exists at $SSH_KEY_PATH. Overwrite? (y/N): " OVERWRITE
    if [[ $OVERWRITE =~ ^[Yy]$ ]]; then
        ssh-keygen -t ed25519 -C "github-deploy-scale-app" -f "$SSH_KEY_PATH" -N ""
    else
        echo "Using existing key."
    fi
else
    ssh-keygen -t ed25519 -C "github-deploy-scale-app" -f "$SSH_KEY_PATH" -N ""
fi

echo ""
echo "Step 2: Copying public key to VPS..."
cat "$SSH_KEY_PATH.pub" | ssh "$CURRENT_USER@$VPS_IP" "sudo -u $DEPLOY_USER tee -a /home/$DEPLOY_USER/.ssh/authorized_keys > /dev/null"
ssh "$CURRENT_USER@$VPS_IP" "sudo chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys && sudo chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh/authorized_keys"

echo ""
echo "Step 3: Testing SSH connection..."
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$DEPLOY_USER@$VPS_IP" "echo 'SSH connection successful!'" > /dev/null 2>&1; then
    echo "✓ SSH connection test successful!"
else
    echo "✗ SSH connection test failed. Please check your configuration."
    exit 1
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "SSH Key Location: $SSH_KEY_PATH"
echo "Public Key Location: $SSH_KEY_PATH.pub"
echo ""
echo "GitHub Secrets to configure:"
echo "  VPS_HOST=$VPS_IP"
echo "  VPS_USER=$DEPLOY_USER"
echo "  VPS_SSH_KEY=<paste contents of private key below>"
echo ""
echo "To get private key contents:"
echo "  cat $SSH_KEY_PATH"
echo ""
echo "To SSH to VPS as deployment user:"
echo "  ssh -i $SSH_KEY_PATH $DEPLOY_USER@$VPS_IP"
echo ""
echo "========================================="
