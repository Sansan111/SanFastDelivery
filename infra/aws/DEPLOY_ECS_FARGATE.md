## Deploy to AWS (ECS Fargate) — Step-by-step

### English

This guide deploys **backend microservices** to AWS using:
- **ECR** (container registry)
- **ECS Fargate** (compute)
- **ALB** (ingress)
- **RDS Postgres** (database)

It’s written to be done in **phases**:
- Phase 1: `gateway-service`, `order-service`, `restaurant-service`, RDS
- Phase 2: add `notification-service`
- Phase 3: add Kafka (MSK) + RabbitMQ (Amazon MQ) + Redis (ElastiCache)

> Frontend recommendation: deploy to **Vercel** (fastest), or to AWS later (S3+CloudFront).

---

### 0) Prerequisites

- AWS account + admin access (for setup)
- AWS CLI installed and configured:

```bash
aws configure
aws sts get-caller-identity
```

- Docker installed and running

Pick a region (example uses `ap-southeast-1`):

```bash
export AWS_REGION="ap-southeast-1"
```

---

### 1) Create ECR repositories

Create one repo per service:

```bash
for repo in gateway-service order-service restaurant-service notification-service; do
  aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION" >/dev/null || true
done
```

Login docker to ECR:

```bash
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com"
```

---

### 2) Build & push images

From repo root:

```bash
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

docker build -t gateway-service -f backend/gateway-service/Dockerfile .
docker build -t order-service -f backend/order-service/Dockerfile .
docker build -t restaurant-service -f backend/restaurant-service/Dockerfile .
docker build -t notification-service -f backend/notification-service/Dockerfile .

for svc in gateway-service order-service restaurant-service notification-service; do
  docker tag "$svc:latest" "$ECR/$svc:latest"
  docker push "$ECR/$svc:latest"
done
```

---

### 3) Create network + ECS + ALB + RDS

**Recommended**: use Terraform (see `infra/terraform/`).

If you want console-only:
- Create VPC with public+private subnets (2+ AZ)
- Create ALB in public subnets
- Create ECS cluster
- Create RDS Postgres in private subnets
- Security groups:
  - ALB: allow 80/443 inbound
  - ECS tasks: allow 8080 inbound from ALB SG; allow 8081/8082 inbound from gateway task SG
  - RDS: allow 5432 inbound from ECS task SGs

---

### 4) Configure ECS task definitions (important env)

You will set environment variables per service in ECS.

#### gateway-service
Update gateway routes for cloud.
Prefer using env vars and referencing them in config:
- `ORDER_SERVICE_URL` (ex: `http://order-service:8082`)
- `RESTAURANT_SERVICE_URL` (ex: `http://restaurant-service:8081`)

#### order-service
Set:
- `SPRING_DATASOURCE_URL` (RDS endpoint)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- If using Kafka/RabbitMQ later, set their hosts too

#### restaurant-service
Set:
- `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`
- `SPRING_DATA_REDIS_HOST/PORT` (if using Redis)
- `GEMINI_API_KEY` (and use env in config)

#### notification-service
Set:
- Kafka bootstrap servers (MSK) OR disable Kafka consumer for phase 1
- RabbitMQ host/creds (Amazon MQ) OR disable Rabbit listener for phase 1

---

### 5) Roll out

Deploy order + restaurant first, then gateway.
Verify via ALB URL:
- `/actuator/health`
- `/api/auth/register`

---

### ไทย (TH)

เอกสารนี้สอน deploy backend ขึ้น AWS ด้วย:
- **ECR**
- **ECS Fargate**
- **ALB**
- **RDS Postgres**

ทำเป็นเฟส:
- เฟส 1: `gateway-service`, `order-service`, `restaurant-service`, RDS
- เฟส 2: เพิ่ม `notification-service`
- เฟส 3: เพิ่ม MSK (Kafka) + Amazon MQ (RabbitMQ) + ElastiCache (Redis)

> Frontend แนะนำ deploy ที่ **Vercel** ก่อน (ง่าย/เร็วสุด)

ขั้นตอนหลัก ๆ:
1) ตั้ง AWS CLI + เลือก region
2) สร้าง ECR repo
3) build/push image ขึ้น ECR
4) สร้าง VPC/ECS/ALB/RDS (แนะนำ Terraform)
5) ตั้งค่า env/secrets ใน ECS task definition (สำคัญมาก)
6) deploy ตามลำดับ (order/restaurant ก่อน แล้วค่อย gateway)

