# Deployment Configuration

Complete deployment setup for self-hosted blog with Jenkins, NGINX, and Cloudflare Tunnel.

## Architecture

```
Git Push → GitHub → Jenkins → npm build → NGINX → Cloudflare Tunnel → Internet
```

**Flow**:
1. Push commits to GitHub
2. GitHub webhook triggers Jenkins
3. Jenkins builds static site (`npm run build`)
4. Deploy script copies files to NGINX root
5. Cloudflare Tunnel exposes site securely (no port forwarding)

## Prerequisites

- Ubuntu/Debian server
- Jenkins installed and running
- NGINX installed
- Node.js installed on Jenkins
- Cloudflare account (free tier works)

## 1. Jenkins Setup

### Install Jenkins

```bash
# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### Configure Jenkins

1. Access Jenkins at `http://localhost:8080`
2. Install suggested plugins
3. Install "NodeJS" plugin (Manage Jenkins → Plugins)
4. Configure Node.js (Manage Jenkins → Tools):
   - Name: `nodejs`
   - Version: Latest LTS
   - Install automatically: ✓

### Create Pipeline Job

1. New Item → Pipeline
2. Configure GitHub webhook (Build Triggers → GitHub hook trigger)
3. Pipeline → Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: Your GitHub repo
6. Branch: `*/master` (or your main branch)
7. Script Path: `Jenkinsfile`

### Setup Deploy Script Permissions

```bash
# Copy deploy script
sudo cp deploy_blog.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/deploy_blog.sh

# Give Jenkins sudo permission for deploy script only
sudo visudo
# Add this line:
jenkins ALL=(ALL) NOPASSWD: /usr/local/bin/deploy_blog.sh
```

## 2. NGINX Setup

### Install NGINX

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configure Site

```bash
# Copy site configuration
sudo cp nginx-site.conf /etc/nginx/sites-available/your-site.com

# Edit the config
sudo nano /etc/nginx/sites-available/your-site.com
# Update: server_name, root directory

# Create web root directory
sudo mkdir -p /var/www/your-site
sudo chown -R www-data:www-data /var/www/your-site

# Enable site
sudo ln -s /etc/nginx/sites-available/your-site.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

## 3. Cloudflare Tunnel Setup

### Install Cloudflared

```bash
# Download and install
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify installation
cloudflared --version
```

### Create Tunnel

```bash
# Login to Cloudflare
cloudflared tunnel login
# Opens browser → authorize Cloudflare

# Create tunnel
cloudflared tunnel create my-blog-tunnel
# Note the Tunnel ID from output

# Copy config template
cp cloudflared-config.yml ~/.cloudflared/config.yml

# Edit config
nano ~/.cloudflared/config.yml
# Update:
#   - tunnel: <YOUR_TUNNEL_ID>
#   - credentials-file: /home/<YOUR_USER>/.cloudflared/<TUNNEL_ID>.json
#   - hostname: your-site.com
```

### Configure DNS

```bash
# Route your domain to the tunnel
cloudflared tunnel route dns my-blog-tunnel your-site.com

# Or add subdomain:
cloudflared tunnel route dns my-blog-tunnel blog.your-site.com
```

### Run Tunnel as Service

```bash
# Install as system service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

## 4. GitHub Webhook Setup

1. Go to your GitHub repo → Settings → Webhooks
2. Add webhook:
   - Payload URL: `http://your-jenkins-url:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Just the push event
   - Active: ✓

## 5. Jenkinsfile Explanation

The included `Jenkinsfile` defines the CI/CD pipeline:

```groovy
stages:
  - Health check: Verify Node.js/npm availability
  - Install dependencies: npm install
  - Build: npm run build (creates /out directory)
  - Deploy to Nginx: Runs deploy_blog.sh script
  - Archive site: Saves build artifacts
```

**Important**: Update the deploy stage with your site name:
```groovy
sh 'sudo /usr/local/bin/deploy_blog.sh YOUR-SITE-NAME out'
```

## 6. Testing the Pipeline

```bash
# Make a change to your blog
echo "test" >> content/posts/welcome.mdx

# Commit and push
git add .
git commit -m "Test deployment"
git push origin master

# Watch Jenkins build
# Check NGINX logs
sudo tail -f /var/log/nginx/access.log

# Visit your site
curl http://localhost
# Or visit https://your-site.com
```

## Troubleshooting

### Jenkins Build Fails

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Check Node.js is available to Jenkins
# In Jenkins job: Build → Execute shell
node -v
npm -v
```

### Deploy Script Fails

```bash
# Check permissions
ls -la /usr/local/bin/deploy_blog.sh

# Test deploy manually as jenkins user
sudo -u jenkins sudo /usr/local/bin/deploy_blog.sh test out

# Check NGINX directory permissions
ls -la /var/www/
```

### NGINX Not Serving Site

```bash
# Check NGINX status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Verify files exist
ls -la /var/www/your-site/
```

### Cloudflare Tunnel Issues

```bash
# Check service status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -n 50

# Test tunnel connectivity
cloudflared tunnel info

# Restart tunnel
sudo systemctl restart cloudflared
```

### DNS Not Resolving

```bash
# Check tunnel routing
cloudflared tunnel route dns list

# Verify DNS propagation
dig your-site.com
nslookup your-site.com

# Check Cloudflare dashboard
# Ensure DNS records point to tunnel
```

## Security Considerations

1. **Firewall**: Only expose ports 22 (SSH) and 8080 (Jenkins, if needed). Cloudflare Tunnel handles web traffic.

```bash
sudo ufw allow 22
sudo ufw allow 8080  # Only if accessing Jenkins externally
sudo ufw enable
```

2. **Jenkins Security**:
   - Enable authentication
   - Use HTTPS for Jenkins (or put behind reverse proxy)
   - Limit GitHub webhook to specific IP ranges

3. **NGINX Security**:
   - Included in `nginx-site.conf`: security headers, gzip, caching
   - Consider adding rate limiting
   - Keep NGINX updated

4. **Regular Updates**:
```bash
sudo apt update && sudo apt upgrade -y
```

## Maintenance

### View Deployment History

```bash
# Jenkins artifacts are stored per build
ls /var/lib/jenkins/jobs/YOUR-JOB/builds/*/archive/

# NGINX access logs
sudo tail -f /var/log/nginx/access.log
```

### Manual Deployment

```bash
# Build locally
cd /path/to/blog
npm run build

# Deploy
sudo /usr/local/bin/deploy_blog.sh your-site out
```

### Rollback

```bash
# Copy previous build from Jenkins artifacts
sudo cp -r /var/lib/jenkins/jobs/YOUR-JOB/builds/PREVIOUS-BUILD/archive/out/* /var/www/your-site/
```

## Alternative Deployments

This setup can be adapted for:
- **Multiple sites**: Add more sites to NGINX, route different domains in Cloudflare Tunnel
- **Development/staging**: Create separate Jenkins jobs, NGINX configs, tunnel routes
- **Other frameworks**: Modify Jenkinsfile build commands, works with any static site generator

## Cost Breakdown

- **Server**: $5-10/month (Linode, DigitalOcean, Hetzner)
- **Cloudflare Tunnel**: Free
- **Domain**: $10-15/year
- **Total**: ~$70-130/year

Much cheaper than managed hosting while you control everything!
