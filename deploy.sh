#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
TF_DIR="$PROJECT_ROOT/infra/terraform"
KEY_PATH="$HOME/.ssh/sanfast-key"

echo "============================================"
echo "  SanFastDelivery - AWS Deployment Script"
echo "============================================"
echo ""

# ─── Step 1: Check prerequisites ───
echo "[1/6] Checking prerequisites..."

for cmd in aws terraform ssh-keygen; do
  if ! command -v $cmd &>/dev/null; then
    echo "ERROR: $cmd is not installed."
    exit 1
  fi
done

aws sts get-caller-identity > /dev/null 2>&1 || { echo "ERROR: AWS CLI not configured."; exit 1; }
echo "  ✓ AWS CLI, Terraform, SSH tools ready"

# ─── Step 2: Generate SSH key if needed ───
echo ""
echo "[2/6] Setting up SSH key..."

if [ ! -f "$KEY_PATH" ]; then
  ssh-keygen -t ed25519 -f "$KEY_PATH" -N "" -q
  echo "  ✓ SSH key generated at $KEY_PATH"
else
  echo "  ✓ SSH key already exists at $KEY_PATH"
fi

SSH_PUB_KEY=$(cat "$KEY_PATH.pub")

# ─── Step 3: Terraform init & apply ───
echo ""
echo "[3/6] Provisioning AWS infrastructure with Terraform..."

cd "$TF_DIR"
terraform init -input=false

terraform apply -auto-approve \
  -var="ssh_public_key=$SSH_PUB_KEY"

PUBLIC_IP=$(terraform output -raw public_ip)
echo ""
echo "  ✓ Server provisioned at: $PUBLIC_IP"

# ─── Step 4: Wait for instance to be ready ───
echo ""
echo "[4/6] Waiting for server to be ready (this may take 2-3 minutes)..."

sleep 30

MAX_RETRIES=20
RETRY=0
while ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$KEY_PATH" ec2-user@"$PUBLIC_IP" "echo ok" &>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "ERROR: Server did not become reachable after $MAX_RETRIES attempts."
    exit 1
  fi
  echo "  Waiting... (attempt $RETRY/$MAX_RETRIES)"
  sleep 15
done
echo "  ✓ Server is reachable via SSH"

echo "  Waiting for user-data script to complete..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ec2-user@"$PUBLIC_IP" \
  'while [ ! -f /var/log/user-data.log ] || ! grep -q "User data script completed" /var/log/user-data.log; do sleep 5; done'
echo "  ✓ Server setup completed"

# ─── Step 5: Upload code & build ───
echo ""
echo "[5/6] Uploading code to server..."

cd "$PROJECT_ROOT"

rsync -azP --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'target' \
  --exclude '.dev-pids' \
  --exclude 'infra' \
  --exclude '*.log' \
  -e "ssh -o StrictHostKeyChecking=no -i $KEY_PATH" \
  . ec2-user@"$PUBLIC_IP":/home/ec2-user/app/

echo "  ✓ Code uploaded"

# ─── Step 6: Build and start services ───
echo ""
echo "[6/6] Building and starting services on server..."

ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ec2-user@"$PUBLIC_IP" << 'REMOTESCRIPT'
cd /home/ec2-user/app

# Get the server's public IP and set it in .env
TOKEN=$(curl -s --connect-timeout 2 -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
PUBLIC_IP=$(curl -s --connect-timeout 2 -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
echo "PUBLIC_IP=$PUBLIC_IP" >> .env

echo "Building and starting all services (this may take 5-10 minutes on first run)..."
docker-compose -f docker-compose.prod.yml --env-file .env up -d --build

echo ""
echo "Waiting for services to start..."
sleep 30

echo ""
echo "Service status:"
docker-compose -f docker-compose.prod.yml ps
REMOTESCRIPT

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  Frontend:  http://$PUBLIC_IP"
echo "  Gateway:   http://$PUBLIC_IP:8080"
echo ""
echo "  SSH:       ssh -i $KEY_PATH ec2-user@$PUBLIC_IP"
echo ""
echo "  To view logs:  ssh -i $KEY_PATH ec2-user@$PUBLIC_IP 'cd app && docker-compose -f docker-compose.prod.yml logs -f'"
echo "  To stop:       ssh -i $KEY_PATH ec2-user@$PUBLIC_IP 'cd app && docker-compose -f docker-compose.prod.yml down'"
echo "  To destroy:    cd infra/terraform && terraform destroy"
echo ""
