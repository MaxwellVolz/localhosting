#!/bin/bash
# deploy_blog.sh - Deploy static site to NGINX
# Usage: sudo /usr/local/bin/deploy_blog.sh <site-name> <source-dir>
# Example: sudo /usr/local/bin/deploy_blog.sh myblog out

set -e

SITE_NAME=$1
SOURCE_DIR=$2

if [ -z "$SITE_NAME" ] || [ -z "$SOURCE_DIR" ]; then
    echo "Usage: $0 <site-name> <source-dir>"
    echo "Example: $0 myblog out"
    exit 1
fi

NGINX_ROOT="/var/www/$SITE_NAME"

echo "Deploying $SITE_NAME from $SOURCE_DIR to $NGINX_ROOT"

# Create NGINX directory if it doesn't exist
mkdir -p "$NGINX_ROOT"

# Remove old files
rm -rf "$NGINX_ROOT"/*

# Copy new files
cp -r "$SOURCE_DIR"/* "$NGINX_ROOT/"

# Set proper permissions
chown -R www-data:www-data "$NGINX_ROOT"
chmod -R 755 "$NGINX_ROOT"

echo "✅ Deployment completed successfully"
echo "📁 Files deployed to: $NGINX_ROOT"
