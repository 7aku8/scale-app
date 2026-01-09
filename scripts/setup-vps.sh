#!/bin/bash
set -e

echo "Setting up VPS for scale-app deployment..."

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose v2
sudo apt-get install docker-compose-plugin -y

# Create deployment user
DEPLOY_USER="deployer"
echo "Creating deployment user: $DEPLOY_USER"
sudo useradd -m -s /bin/bash $DEPLOY_USER

# Add deployer to docker group
sudo usermod -aG docker $DEPLOY_USER

# Create SSH directory for deployer
sudo mkdir -p /home/$DEPLOY_USER/.ssh
sudo chmod 700 /home/$DEPLOY_USER/.ssh

# Create directories for application
sudo mkdir -p /opt/scale-app
sudo chown $DEPLOY_USER:$DEPLOY_USER /opt/scale-app

# Switch to deployer user context for directory setup
sudo -u $DEPLOY_USER bash << 'DEPLOYER_SETUP'
cd /opt/scale-app
mkdir -p mosquitto/{config,data,log}
mkdir -p monitoring/{prometheus,grafana,loki,promtail}
mkdir -p backups scripts
DEPLOYER_SETUP

cd /opt/scale-app

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 1883/tcp
sudo ufw allow 9001/tcp
sudo ufw --force enable

# Create .env template
cat > .env.example << 'EOL'
DB_USER=scaleuser
DB_PASSWORD=CHANGEME
DB_NAME=scale_production

REDIS_PASSWORD=CHANGEME

MQTT_USERNAME=scaledevice
MQTT_PASSWORD=CHANGEME

BETTER_AUTH_SECRET=CHANGEME_64CHARS
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

BACKEND_DOMAIN=api.yourdomain.com
FRONTEND_DOMAIN=app.yourdomain.com
MONITORING_DOMAIN=monitoring.yourdomain.com

ACME_EMAIL=admin@yourdomain.com

GRAFANA_ADMIN_PASSWORD=CHANGEME
MONITORING_HTPASSWD=admin:$apr1$...

GITHUB_REPOSITORY_OWNER=your-github-username
EOL

# Set ownership
sudo chown $DEPLOY_USER:$DEPLOY_USER /opt/scale-app/.env.example

echo ""
echo "========================================="
echo "VPS setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Set up SSH key for deployer user:"
echo "   On your local machine, generate SSH key:"
echo "   ssh-keygen -t ed25519 -C 'github-deploy' -f ~/.ssh/scale-app-deploy"
echo ""
echo "2. Add public key to deployer user:"
echo "   cat ~/.ssh/scale-app-deploy.pub | ssh YOUR_CURRENT_USER@YOUR_VPS 'sudo -u deployer tee -a /home/deployer/.ssh/authorized_keys'"
echo "   ssh YOUR_CURRENT_USER@YOUR_VPS 'sudo chmod 600 /home/deployer/.ssh/authorized_keys'"
echo ""
echo "3. Test SSH access as deployer:"
echo "   ssh -i ~/.ssh/scale-app-deploy deployer@YOUR_VPS"
echo ""
echo "4. Copy .env.example to .env and configure:"
echo "   sudo -u deployer cp /opt/scale-app/.env.example /opt/scale-app/.env"
echo "   sudo -u deployer nano /opt/scale-app/.env"
echo ""
echo "5. Set GitHub Secret VPS_USER=deployer"
echo "6. Set GitHub Secret VPS_SSH_KEY=<contents of ~/.ssh/scale-app-deploy>"
echo ""
echo "Deployment user: $DEPLOY_USER"
echo "Application directory: /opt/scale-app"
echo "========================================="
