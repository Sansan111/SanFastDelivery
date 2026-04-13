#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1

echo "=== Adding 4GB swap ==="
dd if=/dev/zero of=/swapfile bs=128M count=32
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab

echo "=== Installing Docker ==="
dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

echo "=== Installing Docker Compose ==="
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

echo "=== Creating app directory ==="
mkdir -p /home/ec2-user/app
chown ec2-user:ec2-user /home/ec2-user/app

echo "=== Writing environment file ==="
cat > /home/ec2-user/app/.env << 'ENVEOF'
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
RABBITMQ_USER=${rabbitmq_user}
RABBITMQ_PASS=${rabbitmq_pass}
GEMINI_API_KEY=${gemini_api_key}
ENVEOF
chmod 600 /home/ec2-user/app/.env
chown ec2-user:ec2-user /home/ec2-user/app/.env

echo "=== User data script completed ==="
echo "Ready to receive application code."
