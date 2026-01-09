# Deployment Guide

This guide walks you through deploying the Scale App to a VPS using a dedicated deployment user.

## Security Best Practices

This deployment uses a **dedicated deployment user** (`deployer`) instead of root or your personal user account:

✅ **Benefits:**
- Principle of least privilege
- Isolation from personal accounts
- Easy to audit deployment actions
- Can be revoked without affecting other access
- Follows industry security standards

---

## Prerequisites

- Ubuntu VPS (20.04+ recommended)
- Root or sudo access to VPS
- Domain names configured (DNS A records)
- GitHub repository

---

## Step 1: Initial VPS Setup

SSH into your VPS with your current user (root or personal account):

```bash
ssh your-user@your-vps-ip
```

Download and run the setup script:

```bash
curl -o setup-vps.sh https://raw.githubusercontent.com/YOUR_USERNAME/scale-app/master/scripts/setup-vps.sh
bash setup-vps.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Create `deployer` user
- Add deployer to docker group
- Create `/opt/scale-app` directory
- Set up firewall rules (UFW)
- Create `.env.example` template

---

## Step 2: SSH Key Setup for Deployer User

### Option A: Automated Script (Recommended)

On your **local machine**, run:

```bash
bash scripts/setup-ssh-key.sh
```

Follow the prompts. The script will:
1. Generate SSH key pair
2. Copy public key to VPS deployer user
3. Test the connection
4. Display GitHub secrets to configure

### Option B: Manual Setup

On your **local machine**:

```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "github-deploy-scale-app" -f ~/.ssh/scale-app-deploy

# 2. Copy public key to VPS
cat ~/.ssh/scale-app-deploy.pub | ssh your-user@your-vps-ip \
  'sudo -u deployer tee -a /home/deployer/.ssh/authorized_keys'

# 3. Set correct permissions
ssh your-user@your-vps-ip \
  'sudo chmod 600 /home/deployer/.ssh/authorized_keys && \
   sudo chown deployer:deployer /home/deployer/.ssh/authorized_keys'

# 4. Test connection
ssh -i ~/.ssh/scale-app-deploy deployer@your-vps-ip
```

---

## Step 3: Configure VPS Environment

SSH to VPS as deployer:

```bash
ssh -i ~/.ssh/scale-app-deploy deployer@your-vps-ip
```

Create and configure `.env` file:

```bash
cd /opt/scale-app
cp .env.example .env
nano .env
```

Update these values:

```bash
# Database
DB_USER=scaleuser
DB_PASSWORD=<generate-strong-password>
DB_NAME=scale_production

# Redis
REDIS_PASSWORD=<generate-strong-password>

# MQTT
MQTT_USERNAME=scaledevice
MQTT_PASSWORD=<generate-strong-password>

# Auth (generate with: openssl rand -base64 64 | tr -d '\n')
BETTER_AUTH_SECRET=<64-char-random-string>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>

# Domains (replace with your actual domains)
BACKEND_DOMAIN=api.yourdomain.com
FRONTEND_DOMAIN=app.yourdomain.com
MONITORING_DOMAIN=monitoring.yourdomain.com

# SSL
ACME_EMAIL=admin@yourdomain.com

# Monitoring
GRAFANA_ADMIN_PASSWORD=<generate-strong-password>
MONITORING_HTPASSWD=<generate-with-htpasswd>

# GitHub
GITHUB_REPOSITORY_OWNER=your-github-username
```

### Generate MQTT Password File

```bash
docker run -it --rm -v /opt/scale-app/mosquitto/config:/config eclipse-mosquitto:2.0.22 \
  mosquitto_passwd -c /config/password.txt scaledevice
```

Enter the same password as `MQTT_PASSWORD` in your `.env` file.

---

## Step 4: Configure DNS

Create A records pointing to your VPS IP:

| Hostname | Type | Value |
|----------|------|-------|
| api.yourdomain.com | A | YOUR_VPS_IP |
| app.yourdomain.com | A | YOUR_VPS_IP |
| monitoring.yourdomain.com | A | YOUR_VPS_IP |

Verify DNS propagation:
```bash
dig api.yourdomain.com +short
```

---

## Step 5: Configure GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

### VPS Configuration
```
VPS_HOST=your-vps-ip-address
VPS_USER=deployer
```

### SSH Key
```bash
# Copy the PRIVATE key (run on your local machine):
cat ~/.ssh/scale-app-deploy
```
Create secret `VPS_SSH_KEY` and paste the entire private key (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`).

### Database
```
DB_USER=scaleuser
DB_PASSWORD=<from-your-.env>
DB_NAME=scale_production
```

### Redis
```
REDIS_PASSWORD=<from-your-.env>
```

### MQTT
```
MQTT_USERNAME=scaledevice
MQTT_PASSWORD=<from-your-.env>
```

### Authentication
```
BETTER_AUTH_SECRET=<from-your-.env>
GOOGLE_CLIENT_ID=<from-your-.env>
GOOGLE_CLIENT_SECRET=<from-your-.env>
```

### Domains
```
BACKEND_DOMAIN=api.yourdomain.com
FRONTEND_DOMAIN=app.yourdomain.com
MONITORING_DOMAIN=monitoring.yourdomain.com
ACME_EMAIL=admin@yourdomain.com
```

### Monitoring
```
GRAFANA_ADMIN_PASSWORD=<from-your-.env>
```

Generate `MONITORING_HTPASSWD`:
```bash
# On your local machine (requires apache2-utils):
htpasswd -nb admin your-password
# Output: admin:$apr1$...
# Copy the entire output to MONITORING_HTPASSWD secret
```

### Frontend Build Args
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### GitHub Container Registry
```
GITHUB_REPOSITORY_OWNER=your-github-username
```

---

## Step 6: Deploy

### Option A: Automatic Deployment (Recommended)

Push changes to master branch:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin master
```

GitHub Actions will automatically:
1. Build Docker images
2. Push to GitHub Container Registry
3. Deploy to VPS
4. Verify health checks

### Option B: Manual First Deployment

If you prefer to deploy manually first:

```bash
# On VPS as deployer user
cd /opt/scale-app

# Make sure deployment files are present
# (copy them manually or use git clone)

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull images
docker compose -f docker-compose.prod.yml pull

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Option C: Tag-based Deployment

Create a version tag to trigger deployment:

```bash
git tag -a backend-v1.0.0 -m "Initial backend release"
git push origin backend-v1.0.0

git tag -a frontend-v1.0.0 -m "Initial frontend release"
git push origin frontend-v1.0.0
```

---

## Step 7: Verify Deployment

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend
curl https://app.yourdomain.com

# Grafana
curl https://monitoring.yourdomain.com/grafana
```

### Check Logs

```bash
# SSH to VPS as deployer
ssh -i ~/.ssh/scale-app-deploy deployer@your-vps-ip

# View all services
docker compose -f /opt/scale-app/docker-compose.prod.yml logs -f

# View specific service
docker compose -f /opt/scale-app/docker-compose.prod.yml logs -f backend
```

### Access Monitoring

- **Grafana**: https://monitoring.yourdomain.com/grafana
  - Username: `admin`
  - Password: `<GRAFANA_ADMIN_PASSWORD from .env>`

- **Prometheus**: https://monitoring.yourdomain.com/prometheus
  - Protected by basic auth (MONITORING_HTPASSWD)

---

## Deployment User Permissions

The `deployer` user has:

✅ **Allowed:**
- Docker commands (member of docker group)
- Read/write access to `/opt/scale-app`
- SSH access with key-based authentication

❌ **Not Allowed:**
- Root access (no sudo privileges)
- Access to other users' home directories
- System-wide configuration changes

### To Give Deployer Sudo Access (Optional, Not Recommended)

Only if absolutely necessary:

```bash
# On VPS as root or sudo user
echo "deployer ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/deployer
```

⚠️ **Warning:** This reduces security. Only add if required.

---

## Troubleshooting

### Can't SSH as deployer

```bash
# Check SSH key permissions on local machine
chmod 600 ~/.ssh/scale-app-deploy

# Check authorized_keys on VPS
ssh your-user@your-vps-ip
sudo cat /home/deployer/.ssh/authorized_keys
sudo chmod 600 /home/deployer/.ssh/authorized_keys
sudo chown deployer:deployer /home/deployer/.ssh/authorized_keys
```

### Deployer can't run Docker commands

```bash
# Add deployer to docker group
sudo usermod -aG docker deployer

# Restart shell or log out and back in
```

### Permission denied on /opt/scale-app

```bash
# Fix ownership
sudo chown -R deployer:deployer /opt/scale-app
```

### GitHub Actions can't deploy

- Verify `VPS_SSH_KEY` secret contains the **private** key
- Verify `VPS_USER=deployer` in secrets
- Test SSH connection manually from your machine

---

## Security Hardening (Optional)

### Disable Password Authentication

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

### Set Up Fail2Ban

```bash
sudo apt-get install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Enable Automatic Security Updates

```bash
sudo apt-get install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## Maintenance

### Backups

Automated daily backups run at 2 AM UTC via GitHub Actions.

Manual backup:
```bash
ssh -i ~/.ssh/scale-app-deploy deployer@your-vps-ip
/opt/scale-app/scripts/backup-db.sh
```

### View Backup Files

```bash
ls -lh /opt/scale-app/backups/
```

### Restore from Backup

```bash
# On VPS as deployer
cd /opt/scale-app/backups
gunzip < db-backup-2024-01-09.sql.gz | \
  docker exec -i scale-db psql -U $DB_USER -d $DB_NAME
```

### Update Application

Just push to master or create a new tag:

```bash
git tag -a backend-v1.1.0 -m "Update backend"
git push origin backend-v1.1.0
```

---

## Rollback

### Option 1: Redeploy Previous Image

```bash
# On VPS as deployer
export BACKEND_VERSION=master-abc123def
docker compose -f /opt/scale-app/docker-compose.prod.yml up -d --no-deps backend
```

### Option 2: Re-run Previous Workflow

Go to GitHub Actions → Select successful workflow → Re-run jobs

---

## Additional Resources

- **Deployment Plan**: See `/Users/7akub/.claude/plans/cached-stargazing-flask.md`
- **GitHub Actions**: `.github/workflows/build-and-deploy.yml`
- **Docker Compose**: `docker-compose.prod.yml`

---

## Support

For issues or questions:
1. Check logs: `docker compose logs -f`
2. Check GitHub Actions workflow runs
3. Verify all secrets are correctly configured
4. Check VPS resources: `docker stats`
